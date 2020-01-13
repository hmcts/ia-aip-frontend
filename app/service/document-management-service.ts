import config from 'config';
import { Request } from 'express';
import * as fs from 'fs';
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
  file: string;
  role: string;
  classification: Classification;
}

/**
 * Deletes the temporary upload file created by multer
 * @param path the path to the file
 */
function cleanTempFile(path: string) {
  logger.trace(`Attempting to deleted temporary upload file:`, logLabel);
  fs.unlink(path, (err) => {
    if (err) {
      return logger.trace(`There was an error while deleting temporary upload file: '${err}'`, logLabel);
    }
    logger.trace(`Temporary upload file deleted successfully`, logLabel);
  });
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
      files: fs.createReadStream(uploadData.file),
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
      file: req.file.path,
      role: 'citizen',
      classification: Classification.restricted
    };
    return this.upload(userId, headers, uploadData)
      .then(response => {
        cleanTempFile(req.file.path);
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
   * @param fileId - the target file id to be deleted
   */
  async deleteFile(req: Request, fileLocation: string): Promise<DocumentUploadResponse> {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.id;

    logger.trace(`Received call from user '${userId}' to delete file with id: '21'`, logLabel);
    return this.delete(userId, headers, fileLocation);
  }
}

export {
  DocumentManagementService
};
