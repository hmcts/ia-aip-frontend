const multer = require('multer');
import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import {
  enforceFileSizeLimit, fileFilter, handleFileUploadErrors, uploadConfiguration
} from '../../../app/middleware/file-upload-validation-middleware';
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
    // error message will show max file size as 0.001MB

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

describe('#enforceFileSizeLimit middleware', () => {
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

  it('should do nothing if no file.', () => {
    // Because the file size is being overriden on the development config for testing purposes
    // error message will show max file size as 0.001MB
    req = { file: null } as any;
    enforceFileSizeLimit(req, res, next);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should do nothing if file is of good size.', () => {
    req = { file: { size: 1000 } } as any;
    enforceFileSizeLimit(req, res, next);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should throw multer LIMIT_FILE_TYPE error', () => {
    const nextStub: sinon.SinonStub = sinon.stub();
    req = { file: { size: 1024 * 1024 * 10 } } as any;

    enforceFileSizeLimit(req, res, nextStub);

    expect(req.file).to.be.undefined; // File should be deleted
    expect(nextStub).to.have.been.calledOnce.calledWith(sinon.match.instanceOf(multer.MulterError));
    expect(nextStub.args[0][0].code).to.equal('LIMIT_FILE_SIZE'); // Ensure the correct error code
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

describe('fileSize limit', () => {
  const app = express();
  app.post('/upload', uploadConfiguration, enforceFileSizeLimit, handleFileUploadErrors, (req, res) => {
    res.status(200).send(res.locals.multerError ? res.locals.multerError : 'File uploaded successfully');
  });

  it('should allow files within the size limit', async () => {
    const smallFile = Buffer.alloc(1); // 1 byte file
    await request(app)
      .post('/upload')
      .attach('file-upload', smallFile, 'small-file.pdf')
      .expect(200, 'File uploaded successfully');
  });

  it('should reject files exceeding the size limit', async () => {
    const largeFile = Buffer.alloc(1024 * 1024 * 10); // 10MB file
    app.use((req, res, next) => {
      res.locals = {}; // Initialize res.locals for testing
      next();
    });
    const response = await request(app)
      .post('/upload')
      .attach('file-upload', largeFile, 'large-file.pdf')
      .expect(200);

    expect(response.text).to.include('The selected file must be smaller than');
  });
});
