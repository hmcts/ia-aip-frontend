import { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import i18n from '../../locale/en.json';

const multer = require('multer');
const config = require('config');
const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
const SUPPORTED_FORMATS: string[] = config.get('evidenceUpload.supportedFormats');

function fileFilter(req, file, cb) {
  const fileTypeError = 'LIMIT_FILE_TYPE';
  if (SUPPORTED_FORMATS.includes(path.extname(file.originalname.toLowerCase()))) {
    cb(null, true);
  } else {
    cb(new multer.MulterError(fileTypeError), false);
  }
}

/**
 * Multer upload configuration that includes limits for file type formats and limits for the size
 */
const uploadConfiguration = multer({
  storage: multer.memoryStorage(),
  fileFilter
}).single('file-upload');

function handleFileUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  let error: string;
  let errorCode: string;
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = `${i18n.validationErrors.fileUpload.fileTooLarge}`;
      errorCode = 'fileTooLarge';
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      const supported: string = SUPPORTED_FORMATS.join(', ');
      error = `${i18n.validationErrors.fileUpload.incorrectFormat}`;
      errorCode = 'incorrectFormat';
    } else {
      error = i18n.validationErrors.fileUpload.fileCannotBeUploaded;
      errorCode = 'fileCannotBeUploaded';
    }
    res.locals.errorCode = errorCode;
    res.locals.multerError = error;
    return next();
  }
  return next(err);
}

// Middleware to enforce file size limit - needs to be placed before handleFileUploadErrors middleware
function enforceFileSizeLimit(req: Request, res: Response, next: NextFunction) {
  if (req.file && req.file.size > maxFileSizeInMb * 1024 * 1024) {
    delete req.file;
    return next(new multer.MulterError('LIMIT_FILE_SIZE'));
  }
  return next();
}

export {
  uploadConfiguration,
  handleFileUploadErrors,
  enforceFileSizeLimit,
  fileFilter
};
