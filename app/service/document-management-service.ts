import config from 'config';
import { Request } from 'express';
import rp from 'request-promise';
import { v4 as uuid } from 'uuid';
import Logger, { getLogLabel } from '../utils/logger';
import { AuthenticationService, SecurityHeaders } from './authentication-service';

const documentManagementBaseUrl = config.get('documentManagement.apiUrl');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

interface Href {
  href: string;
}

interface Links {
  self: Href;
  binary: Href;
  thumbnail: Href;
}

interface Document {
  size: number;
  mimeType: string;
  originalDocumentName: string;
  modifiedOn: Date;
  createdOn: Date;
  classification: string;
  _links: Links;
}

interface Embedded {
  documents: Document[];
}

interface DocumentManagementStoreResponse {
  _embedded: Embedded;
}

enum Classification {
  public = 'PUBLIC',
  private = 'PRIVATE',
  restricted = 'RESTRICTED'
}

class UploadData {
  file: Express.Multer.File;
  role: string;
  classification: Classification;
}

/**
 * Attempts to find the document store url if found on the documentMap returns the document store file location as a URL
 * @param id the fileId used as a lookup key
 * @param documentMap the document map array.
 */
function documentMapToDocStoreUrl(id: string, documentMap: DocumentMap[]): string {
  const target: DocumentMap = documentMap.find(e => e.id === id);
  return target.url;
}

/**
 * Adds the document store url into a mapper and returns back it's assigned key.
 * @param documentUrl the document url to be inserted in the map
 * @param documentMap the document map array.
 */
function addToDocumentMapper(documentUrl: string, documentMap: DocumentMap[]) {
  const documentId: string = uuid();
  documentMap.push({
    id: documentId,
    url: documentUrl
  });

  return documentId;
}

class DocumentManagementService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  private createOptions(userId: string, headers: SecurityHeaders, uri: string) {
    return {
      uri: uri,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        'user-id': userId
      }
    };
  }

  private async upload(userId: string, headers: SecurityHeaders, uploadData: UploadData): Promise<any> {
    const options: any = this.createOptions(
      userId,
      headers,
      `${documentManagementBaseUrl}/documents`
    );

    options.formData = {
      files: [ {
        value: uploadData.file.buffer,
        options: {
          filename: `${Date.now()}-${uploadData.file.originalname}`,
          contentType: uploadData.file.mimetype
        }
      } ],
      classification: uploadData.classification,
      roles: uploadData.role
    };

    return rp.post(options);
  }

  private async delete(userId: string, headers: SecurityHeaders, fileLocation: string): Promise<any> {
    const options: any = this.createOptions(
      userId,
      headers,
      fileLocation
    );
    return rp.delete(options);
  }

  private async fetchBinaryFile(userId: string, headers: SecurityHeaders, fileLocation: string): Promise<any> {
    let options: any = this.createOptions(
      userId,
      headers,
      fileLocation + '/binary'
    );
    options.headers = { 'user-roles': 'caseworker-ia', ...options.headers };
    options = { encoding: 'binary', resolveWithFullResponse: true, ...options };
    return rp.get(options);
  }

  /**
   * Entry point to upload endpoint used to upload files to the document management service,
   * this endpoint takes one file at a time.
   * @param req - the request that contains all necessary information
   * @property {Express.Multer.File} req.file - the file to be uploaded
   * @property {string} req.idam.userDetails.uid - the user id
   */
  async uploadFile(req: Request): Promise<DocumentUploadResponse> {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.uid;

    logger.trace(`Received call to upload file for user with id: '${userId}'`, logLabel);

    const uploadData = {
      file: req.file,
      role: 'citizen',
      classification: Classification.restricted
    };
    return this.upload(userId, headers, uploadData)
      .then(response => {
        const res: DocumentManagementStoreResponse = JSON.parse(response);
        const docName = res._embedded.documents[0].originalDocumentName;
        const documentMapperId: string = addToDocumentMapper(res._embedded.documents[0]._links.self.href, req.session.appeal.documentMap);
        return {
          id: docName,
          fileId: documentMapperId,
          name: docName.substring(docName.indexOf('-') + 1)
        } as DocumentUploadResponse;
      });
  }

  /**
   * Entry point to delete endpoint used to delete files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.uid - the user id
   * @param fileLocation - the target file url to be deleted
   */
  async deleteFile(req: Request, fileLocation: string): Promise<DocumentUploadResponse> {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.uid;

    logger.trace(`Received call from user '${userId}' to delete`, logLabel);
    return this.delete(userId, headers, fileLocation);
  }

  /**
   * Entry point to get endpoint used to retrieve files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.id - the user id
   * @param fileLocation - the target file url to be fetched
   */
  async fetchFile(req: Request, fileLocation: string) {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.uid;
    logger.trace(`Received call from user '${userId}' to fetch file`, logLabel);
    return this.fetchBinaryFile(userId, headers, fileLocation);
  }
}

export {
  DocumentManagementService,
  documentMapToDocStoreUrl,
  addToDocumentMapper
};
