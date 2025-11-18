import config from 'config';
import { Request } from 'express';
import rp from 'request-promise';
import { v4 as uuid } from 'uuid';
import { FEATURE_FLAGS } from '../data/constants';
import { documentIdToDocStoreUrl, fileNameFormatter, toHtmlLink } from '../utils/utils';
import { AuthenticationService } from './authentication-service';
import { CdamDocumentManagementService } from './cdam-document-management-service';
import { DmDocumentManagementService } from './dm-document-management-service';
import LaunchDarklyService from './launchDarkly-service';

class DocumentManagementService {
  private dmDocumentManagementService: DmDocumentManagementService;
  private cdamDocumentManagementService: CdamDocumentManagementService;

  constructor(authenticationService: AuthenticationService) {
    this.dmDocumentManagementService = new DmDocumentManagementService(authenticationService);
    this.cdamDocumentManagementService = new CdamDocumentManagementService(authenticationService);
  }

  async useCDAM(req: Request) {
    return LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false);
  }

  /**
   * Entry point to upload endpoint used to upload files to the document management service,
   * this endpoint takes one file at a time.
   * @param req - the request that contains all necessary information
   * @property {Express.Multer.File} req.file - the file to be uploaded
   * @property {string} req.idam.userDetails.uid - the user id
   */
  async uploadFile(req: Request): Promise<DocumentUploadResponse> {
    if (await this.useCDAM(req)) {
      return this.cdamDocumentManagementService.uploadFile(req);
    } else {
      return this.dmDocumentManagementService.uploadFile(req);
    }
  }

  /**
   * Entry point to delete endpoint used to delete files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.uid - the user id
   * @param fileLocation - the target file url to be deleted
   */
  async deleteFile(req: Request, fileId: string): Promise<DocumentUploadResponse> {
    if (await this.useCDAM(req)) {
      return this.cdamDocumentManagementService.deleteFile(req, fileId);
    } else {
      return this.dmDocumentManagementService.deleteFile(req, fileId);
    }
  }

  /**
   * Entry point to get endpoint used to retrieve files from the document management service
   * @param req - the request that contains all necessary information
   * @property {string} req.idam.userDetails.id - the user id
   * @param fileLocation - the target file url to be fetched
   */
  async fetchFile(req: Request, fileLocation: string) {
    if (await this.useCDAM(req)) {
      return this.cdamDocumentManagementService.fetchFile(req, fileLocation);
    } else {
      return this.dmDocumentManagementService.fetchFile(req, fileLocation);
    }
  }

  public removeFromDocumentMapper(fileId: string, documentMap: DocumentMap[]): DocumentMap[] {
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
  DocumentManagementService
};
