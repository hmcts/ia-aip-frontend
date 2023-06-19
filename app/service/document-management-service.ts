import config from 'config';
import { Request } from 'express';
import * as path from 'path';
import rp from 'request-promise';
import { v4 as uuid } from 'uuid';
import { AuthenticationService, SecurityHeaders } from './authentication-service';
import { fileNameFormatter, toHtmlLink, documentIdToDocStoreUrl } from '../utils/utils';
import { DmDocumentManagementService } from './dm-document-management-service'

class DocumentManagementService {
  private dmDocumentManagementService: DmDocumentManagementService;

  constructor(dmDocumentManagementService: DmDocumentManagementService) {
    this.dmDocumentManagementService = dmDocumentManagementService;
  }

  /**
   * Entry point to upload endpoint used to upload files to the document management service,
   * this endpoint takes one file at a time.
   * @param req - the request that contains all necessary information
   * @property {Express.Multer.File} req.file - the file to be uploaded
   * @property {string} req.idam.userDetails.uid - the user id
   */
  async uploadFile(req: Request): Promise<DocumentUploadResponse> {
    return this.dmDocumentManagementService.uploadFile(req);
  }

  /**
   * Entry point to delete endpoint used to delete files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.uid - the user id
   * @param fileLocation - the target file url to be deleted
   */
  async deleteFile(req: Request, fileId: string): Promise<DocumentUploadResponse> {
    return this.dmDocumentManagementService.deleteFile(req, fileId);
  }

  /**
   * Entry point to get endpoint used to retrieve files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.id - the user id
   * @param fileLocation - the target file url to be fetched
   */
  async fetchFile(req: Request, fileLocation: string) {
    return this.dmDocumentManagementService.fetchFile(req, fileLocation);
  }

  removeFromDocumentMapper(fileId: string, documentMap: DocumentMap[]): DocumentMap[] {
    return this.dmDocumentManagementService.removeFromDocumentMapper(fileId, documentMap);
  }

  /**
   * Adds the document store url into a mapper and returns back it's assigned key.
   * @param documentUrl the document url to be inserted in the map
   * @param documentMap the document map array.
   */
  addToDocumentMapper(documentUrl: string, documentMap: DocumentMap[]) {
    return this.dmDocumentManagementService.addToDocumentMapper(documentUrl, documentMap);
  }

}

export {
  DocumentManagementService
};
