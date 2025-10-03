import config from 'config';
import i18n from '../../locale/en.json';

/**
 * Translates file upload error messages based on the error code provided.
 * @param errorCode the error code value to be used for the error message
 */
export function getFileUploadError(errorCode: string): string {
  let errorMessage: string = i18n.validationErrors.fileUpload[`${errorCode}`];
  if (!errorMessage) {
    return i18n.validationErrors.fileUpload.noFileSelected;
  }
  if (errorMessage.includes('{{maxFileSizeInMb}}')) {
    const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
    return errorMessage.replace('{{maxFileSizeInMb}}', maxFileSizeInMb.toString());
  } else if (errorMessage.includes('{{ supportedFormats | join(\', \') }}')) {
    const supportedFormats: string[] = config.get('evidenceUpload.supportedFormats');
    return errorMessage.replace('{{ supportedFormats | join(\', \') }}', supportedFormats.join(', '));
  } else {
    return errorMessage;
  }
}
