const multer = require('multer');
import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon, { SinonStub } from 'sinon';
import {
  enforceFileSizeLimit, fileFilter, handleFileUploadErrors, uploadConfiguration
} from '../../../app/middleware/file-upload-validation-middleware';

describe('#handleFileUploadErrors middleware', () => {
  let req: Request;
  let res: Response;
  let next: SinonStub;
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
    // error message will show max file size as 0.001MB

    handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_SIZE'), req, res, next);
    expect(res.locals.multerError).to.equal(`The selected file must be smaller than {{maxFileSizeInMb}}MB`);
    expect(next.calledOnceWith()).to.be.true;
  });

  it('should catch multer LIMIT_FILE_TYPE error', () => {
    handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_TYPE'), req, res, next);
    expect(res.locals.multerError).to.equal('The selected file must be a {{ supportedFormats | join(\', \') }}');
    expect(next.calledOnceWith()).to.be.true;
  });

  it('should catch multer generic error', () => {
    handleFileUploadErrors(new multer.MulterError(), req, res, next);
    expect(res.locals.multerError).to.equal('The file cannot be uploaded');
    expect(next.calledOnceWith()).to.be.true;
  });

  it('should catch error and call next with it', () => {
    const error = new Error('An error');
    handleFileUploadErrors(error, req, res, next);
    expect(next.calledOnceWith(error)).to.be.true;
  });
});

describe('#enforceFileSizeLimit middleware', () => {
  let req: Request;
  let res: Response;
  let next: SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    res = {
      locals: {}
    } as any;
    next = sandbox.stub();
  });

  it('should do nothing if no file.', () => {
    // Because the file size is being overriden on the development config for testing purposes
    // error message will show max file size as 0.001MB
    req = { file: null } as any;
    enforceFileSizeLimit(req, res, next);
    expect(next.calledOnceWith()).to.be.true;
  });

  it('should do nothing if file is of good size.', () => {
    req = { file: { size: 1000 } } as any;
    enforceFileSizeLimit(req, res, next);
    expect(next.calledOnceWith()).to.be.true;
  });

  it('should throw multer LIMIT_FILE_TYPE error', () => {
    req = { file: { size: 1024 * 1024 * 10 } } as any;

    enforceFileSizeLimit(req, res, next);

    expect(req.file).to.be.undefined; // File should be deleted
    expect(next.calledOnceWith(sinon.match.instanceOf(multer.MulterError))).to.be.true;
    expect(next.args[0][0].code).to.equal('LIMIT_FILE_SIZE'); // Ensure the correct error code
  });
});

describe('fileFilter', () => {
  it('should allow supported file types', () => {
    const file = { originalname: 'test.pdf' };
    const cb = sinon.stub();

    fileFilter(null, file, cb);

    expect(cb.calledOnceWith(null, true)).to.be.true;
  });

  it('should reject unsupported file types', () => {
    const file = { originalname: 'test.exe' };
    const cb = sinon.stub();

    fileFilter(null, file, cb);

    expect(cb.calledOnce).to.be.true;
    expect(cb.args[0][0]).to.be.instanceOf(Error);
    expect(cb.args[0][0].code).to.equal('LIMIT_FILE_TYPE');
    expect(cb.args[0][1]).to.be.false;
  });
});

describe('fileSize limit middleware', () => {
  let req: any;
  let res: any;
  let next: sinon.SinonStub;

  beforeEach(() => {
    req = {};
    res = { locals: {} };
    next = sinon.stub();
  });

  it('should allow files within the size limit', () => {
    req.file = { size: 1 }; // 1 byte file

    enforceFileSizeLimit(req, res, next);

    expect(next.calledOnceWith()).to.be.true;
    expect(req.file).to.exist; // File should not be deleted
  });

  it('should reject files exceeding the size limit', () => {
    req.file = { size: 1024 * 1024 * 10 }; // 10MB file

    enforceFileSizeLimit(req, res, next);

    expect(req.file).to.be.undefined; // File should be deleted
    expect(next.calledOnceWith(sinon.match.instanceOf(multer.MulterError))).to.be.true;
    expect(next.args[0][0].code).to.equal('LIMIT_FILE_SIZE'); // Ensure the correct error code
  });

  it('should handle file upload errors', () => {
    const error = new multer.MulterError('LIMIT_FILE_SIZE');

    handleFileUploadErrors(error, req, res, next);

    expect(res.locals.multerError).to.include('The selected file must be smaller than');
    expect(next.calledOnceWith()).to.be.true;
  });

  it('should pass through if no error occurs', () => {
    handleFileUploadErrors(null, req, res, next);

    expect(next.calledOnceWith()).to.be.true;
  });
});
