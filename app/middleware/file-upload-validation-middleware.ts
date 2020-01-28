const multer = require('multer');
import { NextFunction, Request, Response } from 'express';
import i18n from '../../locale/en.json';

const config = require('config');
const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
const SUPPORTED_FORMATS = [
  '.jpg', '.jpeg', '.bmp', '.tif', '.tiff', '.png',
  '.pdf', '.txt', '.doc', '.dot', '.docx', '.dotx',
  '.xls', '.xlt', '.xla', '.xlsx', '.xltx', '.xlsb',
  '.ppt', '.pot', '.pps', '.ppa', '.pptx', '.potx',
  '.ppsx', '.rtf', '.csv'
];

function handleFileUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  let error: string;

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = `${i18n.validationErrors.fileUpload.fileTooLarge} ${maxFileSizeInMb}MB`;
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      const supported: string = SUPPORTED_FORMATS.join(', ');
      error = `${i18n.validationErrors.fileUpload.incorrectFormat} ${supported}`;
    } else {
      error = i18n.validationErrors.fileUpload.fileCannotBeUploaded;
    }
    res.locals.multerError = error;
    return next();
  }
  return next(err);
}

export {
  handleFileUploadErrors,
  SUPPORTED_FORMATS
};
