import config from 'config';
import { getFileUploadError } from '../../../app/utils/upload-utils';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('getFileUploadError', () => {
  let configStub: sinon.SinonStub;

  afterEach(() => {
    sinon.restore();
  });

  it('should return the error message with max file size replaced', () => {
    const errorCode = 'fileTooLarge';
    const maxFileSizeInMb = 10;
    const errorMessageTemplate = 'File size exceeds {{maxFileSizeInMb}} MB.';
    i18n.validationErrors.fileUpload[errorCode] = errorMessageTemplate;

    configStub = sinon.stub(config, 'get').withArgs('evidenceUpload.maxFileSizeInMb').returns(maxFileSizeInMb);

    const result = getFileUploadError(errorCode);
    expect(result).to.equal('File size exceeds 10 MB.');
    expect(configStub.calledOnceWith('evidenceUpload.maxFileSizeInMb')).to.equal(true);
  });

  it('should return the error message with supported formats replaced', () => {
    const errorCode = 'unsupportedFormat';
    const supportedFormats = ['jpg', 'png', 'pdf'];
    const errorMessageTemplate = 'Supported formats are {{ supportedFormats | join(\', \') }}.';
    i18n.validationErrors.fileUpload[errorCode] = errorMessageTemplate;

    configStub = sinon.stub(config, 'get').withArgs('evidenceUpload.supportedFormats').returns(supportedFormats);

    const result = getFileUploadError(errorCode);
    expect(result).to.equal('Supported formats are jpg, png, pdf.');
    expect(configStub.calledOnceWith('evidenceUpload.supportedFormats')).to.equal(true);
  });

  it('should return the error message as is if no placeholders are present', () => {
    const errorCode = 'genericError';
    const errorMessage = 'An error occurred during file upload.';
    i18n.validationErrors.fileUpload[errorCode] = errorMessage;

    const result = getFileUploadError(errorCode);
    expect(result).to.equal(errorMessage);
  });

  it('should return default noFileSelected if the error code does not exist in i18n', () => {
    const errorCode = 'nonExistentError';
    const errorMessage = 'someError message';
    i18n.validationErrors.fileUpload.noFileSelected = errorMessage;

    const result = getFileUploadError(errorCode);
    expect(result).to.equal(errorMessage);
  });
});
