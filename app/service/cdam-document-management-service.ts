import axios from 'axios';
import config from 'config';
import { Request } from 'express';
import FormData from 'form-data';
import { v4 as uuid } from 'uuid';
import Logger, { getLogLabel } from '../utils/logger';
import { documentIdToDocStoreUrl } from '../utils/utils';
import { AuthenticationService, SecurityHeaders } from './authentication-service';

const cdamDocumentManagementBaseUrl: string = config.get('cdamDocumentManagement.apiUrl');

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

enum Classification {
  public = 'PUBLIC',
  private = 'PRIVATE',
  restricted = 'RESTRICTED'
}

export class CdamUploadData {
  file: Express.Multer.File;
  classification: Classification;
  caseTypeId: string;
  jurisdictionId: string;
}

class CdamDocumentManagementService {
  private authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  private createOptions(headers: SecurityHeaders, formHeaders: FormData.Headers = {}) {
    return {
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        ...formHeaders
      }
    };
  }

  private async upload(headers: SecurityHeaders, uploadData: CdamUploadData): Promise<any> {
    const url = `${cdamDocumentManagementBaseUrl}/cases/documents`;

    // Log token details for debugging (partial tokens only for security)
    const userTokenPreview = (typeof headers.userToken === 'string' && headers.userToken) ? `${headers.userToken.substring(0, 17)}...` : 'MISSING';
    const serviceTokenPreview = (typeof headers.serviceToken === 'string' && headers.serviceToken) ? `${headers.serviceToken.substring(0, 17)}...` : 'MISSING';
    logger.trace(`CDAM upload request - URL: ${url}, userToken: ${userTokenPreview} (length: ${typeof headers.userToken === 'string' ? headers.userToken.length : 0}), serviceToken: ${serviceTokenPreview} (length: ${typeof headers.serviceToken === 'string' ? headers.serviceToken.length : 0})`, logLabel);

    // Validate tokens before making request
    if (!headers.userToken || headers.userToken === 'Bearer undefined' || headers.userToken === 'Bearer null') {
      const error = new Error(`Invalid user token: token is missing or undefined. Value: ${headers.userToken}`);
      logger.exception(error.message, logLabel);
      throw error;
    }
    if (!headers.serviceToken || headers.serviceToken === 'Bearer undefined' || headers.serviceToken === 'Bearer null') {
      const error = new Error(`Invalid service token: token is missing or undefined. Value: ${headers.serviceToken}`);
      logger.exception(error.message, logLabel);
      throw error;
    }

    const form = new FormData();
    form.append('files', uploadData.file.buffer, {
      filename: uploadData.file.originalname,
      contentType: uploadData.file.mimetype
    });
    form.append('classification', uploadData.classification);
    form.append('caseTypeId', uploadData.caseTypeId);
    form.append('jurisdictionId', uploadData.jurisdictionId);
    const options: any = this.createOptions(
      headers,
      form.getHeaders()
    );

    logger.trace(`CDAM upload form data - classification: ${uploadData.classification}, caseTypeId: ${uploadData.caseTypeId}, jurisdictionId: ${uploadData.jurisdictionId}, filename: ${uploadData.file.originalname}`, logLabel);

    try {
      const response = await axios.post(url, form, options);
      logger.trace(`CDAM upload successful - status: ${response.status}`, logLabel);
      return JSON.stringify(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.exception(`CDAM upload failed: status=${error.response?.status}, statusText=${error.response?.statusText}, data=${JSON.stringify(error.response?.data)}, headers=${JSON.stringify(error.response?.headers)}, url=${url}`, logLabel);
      }
      throw error;
    }
  }

  private async delete(headers: SecurityHeaders, fileLocation: string): Promise<any> {
    const options: any = this.createOptions(headers);
    return axios.delete(fileLocation, options);
  }

  private async fetchBinaryFile(headers: SecurityHeaders, fileLocation: string): Promise<any> {
    let options: any = this.createOptions(headers);
    options.headers = { role: 'citizen', classification: Classification.restricted, ...options.headers };
    options = {
      headers: { role: 'citizen', classification: Classification.restricted, ...this.createOptions(headers).headers },
      responseType: 'arraybuffer' as const
    };
    return axios.get(fileLocation, options);
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
      classification: Classification.restricted,
      caseTypeId: 'Asylum',
      jurisdictionId: 'IA'
    };
    return this.upload(headers, uploadData)
      .then(response => {
        const res = JSON.parse(response);
        const documentMapperId: string = this.addToDocumentMapper(res.documents[0]._links.self.href, req.session.appeal.documentMap);
        return {
          fileId: documentMapperId,
          name: res.documents[0].originalDocumentName
        } as DocumentUploadResponse;
      });
  }

  /**
   * Entry point to delete endpoint used to delete files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.uid - the user id
   * @param fileLocation - the target file url to be deleted
   */
  async deleteFile(req: Request, fileId: string): Promise<DocumentUploadResponse> {
    const headers: SecurityHeaders = await this.authenticationService.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.uid;
    const documentLocationUrl: string = documentIdToDocStoreUrl(fileId, req.session.appeal.documentMap);
    req.session.appeal.documentMap = this.removeFromDocumentMapper(fileId, req.session.appeal.documentMap);
    logger.trace(`Received call from user '${userId}' to delete`, logLabel);
    const prefix = 'documents/';
    const docId = documentLocationUrl.substring(documentLocationUrl.lastIndexOf(prefix) + prefix.length);
    const caseDocumentUrl = `${cdamDocumentManagementBaseUrl}/cases/documents/${docId}`;
    return this.delete(headers, caseDocumentUrl);
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
    const prefix = 'documents/';
    const docId = fileLocation.substring(fileLocation.lastIndexOf(prefix) + prefix.length);
    const caseDocumentUrl = `${cdamDocumentManagementBaseUrl}/cases/documents/${docId}/binary`;
    return this.fetchBinaryFile(headers, caseDocumentUrl);
  }

  removeFromDocumentMapper(fileId: string, documentMap: DocumentMap[]): DocumentMap[] {
    return documentMap.filter(document => document.id !== fileId);
  }

  /**
   * Adds the document store url into a mapper and returns back it's assigned key.
   * @param documentUrl the document url to be inserted in the map
   * @param documentMap the document map array.
   */
  public addToDocumentMapper(documentUrl: string, documentMap: DocumentMap[]) {
    const documentId: string = uuid();
    documentMap.push({
      id: documentId,
      url: documentUrl
    });

    return documentId;
  }
}

export {
  CdamDocumentManagementService
};
