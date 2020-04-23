import config from 'config';
import { Request } from 'express';
import * as path from 'path';
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
 * Takes in a fileName and converts it to the correct display format
 * @param fileName the file name e.g Some_file.pdf
 * @return the formatted name as a string e.g Some_File(PDF)
 */
function fileNameFormatter(fileName: string): string {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const extName = extension.split('.').join('').toUpperCase();
  return `${baseName}(${extName})`;
}

/**
 * Given a file Id, name and base url converts it to a html link.
 * returns a html link using target _blank and noopener noreferrer
 */
function toHtmlLink(fileId: string, name: string, hrefBase: string): string {
  const formattedFileName = fileNameFormatter(name);
  return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${hrefBase}/${fileId}'>${formattedFileName}</a>`;
}

/**
 * Looks up  document store url in the document map and converts it to a html link.
 * returns a html link using target _blank and noopener noreferrer
 */
function docStoreUrlToHtmlLink(hrefBase: string, evidenceName: string, evidenceUrl: string, req: Request): string {
  const fileId = docStoreUrlToId(evidenceUrl, req.session.appeal.documentMap);
  return toHtmlLink(fileId, evidenceName, hrefBase);
}

/**
 * Coverts a document to a html link creating a new entry in the document mapper.
 * Adds the document to documents mapper and returns a html link using target _blank and noopener noreferrer
 */
function documentToHtmlLink(hrefBase: string, evidence: TimeExtensionEvidenceCollection, req: Request): string {
  const fileId = addToDocumentMapper(evidence.value.document_url, req.session.appeal.documentMap);
  return toHtmlLink(fileId, evidence.value.document_filename, hrefBase);
}

/**
 * Attempts to find the document store url if found on the documentMap returns the document store file location as a URL
 * @param id the fileId used as a lookup key
 * @param documentMap the document map array.
 */
function documentIdToDocStoreUrl(id: string, documentMap: DocumentMap[]): string {
  const target: DocumentMap = documentMap.find(e => e.id === id);
  return target.url;
}

/**
 * Attempts to retrieve the internal fileId for a document store url and returns the internal id
 * @param url the url to search for
 * @param documentMap the document map array.
 */
function docStoreUrlToId(url: string, documentMap: DocumentMap[]): string {
  const target: DocumentMap = documentMap.find(e => e.url === url);
  return target.id;
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
          filename: uploadData.file.originalname,
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
        const documentMapperId: string = addToDocumentMapper(res._embedded.documents[0]._links.self.href, req.session.appeal.documentMap);
        return {
          fileId: documentMapperId,
          name: res._embedded.documents[0].originalDocumentName
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
  documentIdToDocStoreUrl,
  docStoreUrlToId,
  addToDocumentMapper,
  documentToHtmlLink,
  docStoreUrlToHtmlLink,
  toHtmlLink
};
