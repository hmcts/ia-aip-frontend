import config from 'config';
import { Request } from 'express';
import rp from 'request-promise';
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
      files: [{
        value: uploadData.file.buffer,
        options: {
          filename: `${Date.now()}-${uploadData.file.originalname}`,
          contentType: uploadData.file.mimetype
        }
      }],
      classification: uploadData.classification,
      role: uploadData.role
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

  /**
   * Entry point to upload endpoint used to upload files to the document management service,
   * this endpoint takes one file at a time.
   * @param req - the request that contains all necessary information
   * @property {Express.Multer.File} req.file - the file to be uploaded
   * @property {string} req.idam.userDetails.id - the user id
   */
  async uploadFile(req: Request): Promise<DocumentUploadResponse> {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.id;

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
        return {
          id: docName,
          url: res._embedded.documents[0]._links.self.href,
          name: docName.substring(docName.indexOf('-') + 1)
        };
      });
  }

  /**
   * Entry point to delete endpoint used to delete files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.id - the user id
   * @param fileLocation - the target file url to be deleted
   */
  async deleteFile(req: Request, fileLocation: string): Promise<DocumentUploadResponse> {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.id;

    logger.trace(`Received call from user '${userId}' to delete`, logLabel);
    return this.delete(userId, headers, fileLocation);
  }
}

export {
  DocumentManagementService
};
