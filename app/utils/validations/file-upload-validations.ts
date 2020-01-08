import i18n from '../../../locale/en.json';

const sizeLimitInMb = 100;

const SUPPORTED_FORMATS = [
  '.jpg', '.jpeg', '.bmp', '.tif', '.tiff', '.png',
  '.pdf', '.txt', '.doc', '.dot', '.docx', '.dotx',
  '.xls', '.xlt', '.xla', '.xlsx', '.xltx', '.xlsb',
  '.ppt', '.pot', '.pps', '.ppa', '.pptx', '.potx',
  '.ppsx', '.rtf', '.csv'
];

function createStructuredError(errorMsg: string) {
  return {
    uploadFile: {
      key: 'uploadFile',
      text: errorMsg,
      href: `#uploadFile`
    }
  };
}

/**
 * Entry point to fileUpload Validation that performs all checks necessary and returns structured errors.
 * @param file the file to be checked
 */
function fileUploadValidation(file: Express.Multer.File) {
  if (!isValidFormatValidation(file.originalname)) {
    const errMsg = i18n.validationErrors.fileUpload.incorrectFormat;
    return createStructuredError(errMsg + SUPPORTED_FORMATS.join(', '));
  }
  if (!isBelowSizeLimitValidation(file.size)) {
    const errMsg = i18n.validationErrors.fileUpload.fileTooLarge;
    return createStructuredError(errMsg + sizeLimitInMb + 'MB');
  }
  return null;
}

/**
 * Given a file name it extracts the file extension and compares it against an array of supported formats
 * returns true if it is a valid supported format else returns false.
 * @param fileName the file name as a string
 */
function isValidFormatValidation(fileName: string): boolean {
  // According to the Document Store - Supported file types are the following:
  const fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
  return SUPPORTED_FORMATS.includes('.' + fileExtension);
}

/**
 * Validates that the file is below the size limit 100MB
 * @param file the file to be validated
 */
function isBelowSizeLimitValidation(file: number): boolean {
  const sizeLimitBytes: number = sizeLimitInMb * 1000 * 1000;
  return file < sizeLimitBytes;
}

export {
  fileUploadValidation,
  isValidFormatValidation,
  isBelowSizeLimitValidation
};
