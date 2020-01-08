/**
 * Given a file name it extracts the file extension and compares it against an array of supported formats
 * returns true if it is a valid supported format else returns false.
 * @param fileName the file name as a string
 */
function isValidFormatValidation(fileName: string): boolean {
  // According to the Document Store - Supported file types are the following:
  const SUPPORTED_FORMATS = [
    '.jpg', '.jpeg', '.bmp', '.tif', '.tiff', '.png',
    '.pdf', '.txt', '.doc', '.dot', '.docx', '.dotx',
    '.xls', '.xlt', '.xla', '.xlsx', '.xltx', '.xlsb',
    '.ppt', '.pot', '.pps', '.ppa', '.pptx', '.potx',
    '.ppsx', '.rtf', '.csv'
  ];
  const fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
  return SUPPORTED_FORMATS.includes(fileExtension);
}

/**
 * Validates that the file is below the size limit 100MB
 * @param file the file to be validated
 */
function isBelowSizeLimitValidation(file: number): boolean {

  if (file < 1024000) {
    return true;
  }
  return false;
}

export {
  isValidFormatValidation,
  isBelowSizeLimitValidation
};
