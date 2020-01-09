import config from 'config';
import { Request } from 'express';
import * as fs from 'fs';
import rp from 'request-promise';
import Logger, { getLogLabel } from '../utils/logger';
import { SecurityHeaders } from './getHeaders';
import IdamService from './idam-service';
import S2SService from './s2s-service';

const documentManagementBaseUrl = config.get('documentManagement.apiUrl');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

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
  private idamService;
  private s2sService;

  constructor(idamService: IdamService, s2sService: S2SService) {
    this.idamService = idamService;
    this.s2sService = s2sService;
  }

  private createOptions(userId: string, headers: SecurityHeaders, uri, uploadData: UploadData) {
    return {
      uri: uri,
      headers: {
        Authorization: headers.userToken,
        ServiceAuthorization: headers.serviceToken,
        userId
      },
      formData: {
        files: fs.createReadStream(uploadData.file),
        classification: uploadData.classification,
        role: uploadData.role
      }
    };
  }

  upload(userId: string, headers: SecurityHeaders, uploadData: UploadData): Promise<any> {
    const options: any = this.createOptions(
      userId,
      headers,
      `${documentManagementBaseUrl}/documents`,
      uploadData);
    return rp.post(options);
  }

  /**
   * Entry point to upload a file
   * @param req the request must contain all necessary information (user Id and file to be uploaded):
   * req.file: Express.Multer.File
   * req.idam.userDetails.id: string
   */
  async uploadFile(req: Request): Promise<any> {
    const headers: SecurityHeaders = await this.getSecurityHeaders(req);
    const userId: string = req.idam.userDetails.id;

    const uploadData = {
      file: req.file.path,
      role: 'citizen',
      classification: Classification.restricted
    };

    logger.trace(`Received call to upload file for user with id: '${userId}'`, logLabel);
    return this.upload(userId, headers, uploadData)
      .then(async (response) => {
        cleanTempFile(req.file.path);
        return response;
      });
  }

  private async getSecurityHeaders(req: Request): Promise<SecurityHeaders> {
    const userToken = this.idamService.getUserToken(req);
    const serviceToken = await this.s2sService.getServiceToken();
    return { userToken, serviceToken };
  }

}

export {
  DocumentManagementService
};
