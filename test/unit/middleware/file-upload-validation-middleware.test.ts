const multer = require('fastify-multer');
import { NextFunction, Request, Response } from 'express';
import { handleFileUploadErrors } from '../../../app/middleware/file-upload-validation-middleware';
import { expect, sinon } from '../../utils/testUtils';

describe('#handleFileUploadErrors middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    res = {
      locals: {}
    } as any;
    next = sandbox.stub();
  });

  it('should catch multer LIMIT_FILE_SIZE error.', () => {
    // Because the file size is being overriden on the development config for testing purposes
    // error message will show max file size as {{maxFileSizeInMb}}MB

    handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_SIZE'), req, res, next);
    expect(res.locals.multerError).to.equal(`The selected file must be smaller than {{maxFileSizeInMb}}MB`);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer LIMIT_FILE_TYPE error', () => {
    handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_TYPE'), req, res, next);
    expect(res.locals.multerError).to.equal('The selected file must be a {{ supportedFormats | join(\', \') }}');
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch multer generic error', () => {
    handleFileUploadErrors(new multer.MulterError(), req, res, next);
    expect(res.locals.multerError).to.equal('The file cannot be uploaded');
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should catch error and call next with it', () => {
    const error = new Error('An error');
    handleFileUploadErrors(error, req, res, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
