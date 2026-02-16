import { NextFunction, Request, Response } from 'express';
import {
  EvidenceUploadConfig,
  getEvidenceYesNo, getSupportingEvidenceDeleteFile,
  getUploadPage,
  postEvidenceYesNo ,postUploadFile
} from '../../../app/controllers/upload-evidence/upload-evidence-controller';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('upload evidence controller', () => {

  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  const evidence = [];
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let uploadEvidenceConfig: Partial<EvidenceUploadConfig>;
  let addEvidenceSpy: sinon.SinonSpy;
  let removeEvidenceSpy: sinon.SinonSpy;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      session: {
        appeal: {
          application: {
            contactDetails: {}
          },
          reasonsForAppeal: {}
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub,
      locals: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub();
    updateAppealService = { submitEvent: sandbox.stub() };
    documentManagementService = { uploadFile: sandbox.stub(), deleteFile: sandbox.stub() };

    addEvidenceSpy = sandbox.spy();
    removeEvidenceSpy = sandbox.spy();
    uploadEvidenceConfig = {
      evidenceDeletePath: 'evidenceDeletePath',
      evidenceYesNoPath: 'evidenceYesNoPath',
      askForMoreTimeFeatureEnabled: false,
      evidenceUploadPath: 'evidenceUploadPath',
      evidenceSubmitPath: 'evidenceSubmitPath',
      cancelPath: 'cancelPath',
      nextPath: 'nextPath',
      getEvidenceFromSessionFunction: () => {
        return evidence;
      },
      addEvidenceToSessionFunction: addEvidenceSpy,
      removeEvidenceFromSessionFunction: removeEvidenceSpy
    } as Partial<EvidenceUploadConfig>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getEvidenceYesNo', () => {
    getEvidenceYesNo('previousPage', { extra: 'model' }, res as Response, next);

    expect(renderStub).to.be.calledOnceWith('ask-for-more-time/supporting-evidence-yes-or-no.njk', {
      previousPage: 'previousPage',
      extra: 'model'
    });
  });

  describe('postEvidenceYesNo', () => {
    it('invalid request', () => {
      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

      const expectedError = {
        href: '#answer',
        key: 'answer',
        text: 'Select Yes if you want to provide supporting evidence'
      };

      expect(renderStub).to.be.calledOnceWith('ask-for-more-time/supporting-evidence-yes-or-no.njk', {
        errorList: [ expectedError ],
        error: { answer: expectedError },
        previousPage: 'previousPage',
        extra: 'model'
      });
    });

    it('yes have evidence', () => {
      req.body.answer = 'yes';
      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

      expect(redirectStub.calledOnceWith('evidenceUploadPath')).to.equal(true);
    });

    it('no have evidence', () => {
      req.body.answer = 'no';
      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

      expect(redirectStub.calledOnceWith('nextPath')).to.equal(true);
    });

    it('no have evidence removes any old evidence', () => {
      req.body.answer = 'no';
      uploadEvidenceConfig.getEvidenceFromSessionFunction = () => {
        return [
          {
            fileId: 'fileId',
            name: 'name.txt'
          }
        ];
      };
      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

      expect(redirectStub.calledOnceWith('nextPath')).to.equal(true);
      expect(removeEvidenceSpy.calledWith('fileId', req)).to.equal(true);
    });
  });

  it('getUploadPage', () => {
    getUploadPage(uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

    expect(renderStub).to.be.calledOnceWith('upload-evidence/evidence-upload-page.njk', {
      evidences: evidence,
      evidenceCTA: 'evidenceDeletePath',
      previousPage: 'evidenceYesNoPath',
      askForMoreTimeFeatureEnabled: false,
      pathToUploadEvidence: 'evidenceUploadPath',
      pathToSubmitEvidence: 'evidenceSubmitPath',
      pathToCancel: 'cancelPath'
    });
  });

  describe('postUploadFile', () => {
    it('Should display validation error when no file has been selected and render upload-evidence/evidence-upload-page.njk', async () => {
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'Select a file'
      };

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('upload-evidence/evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [expectedError],
        evidenceCTA: 'evidenceDeletePath',
        evidences: [],
        pathToSubmitEvidence: 'evidenceSubmitPath',
        pathToUploadEvidence: 'evidenceUploadPath',
        previousPage: 'evidenceYesNoPath',
        pathToCancel: 'cancelPath',
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render upload-evidence/evidence-upload-page.njk ', async () => {
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };

      res.locals.errorCode = 'incorrectFormat';

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('upload-evidence/evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidenceCTA: 'evidenceDeletePath',
        evidences: [],
        pathToSubmitEvidence: 'evidenceSubmitPath',
        pathToUploadEvidence: 'evidenceUploadPath',
        previousPage: 'evidenceYesNoPath',
        pathToCancel: 'cancelPath',
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should display validation error LIMIT_FILE_SIZE and render upload-evidence/evidence-upload-page.njk', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as 0.001MB
      const expectedError: ValidationError = {
        href: '#file-upload',
        key: 'file-upload',
        text: 'The selected file must be smaller than 0.001MB'
      };

      res.locals.errorCode = 'fileTooLarge';

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('upload-evidence/evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidenceCTA: 'evidenceDeletePath',
        evidences: [],
        pathToSubmitEvidence: 'evidenceSubmitPath',
        pathToUploadEvidence: 'evidenceUploadPath',
        previousPage: 'evidenceYesNoPath',
        pathToCancel: 'cancelPath',
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should succeed render upload-evidence/evidence-upload-page.njk with errors ', async () => {

      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Express.Multer.File;

      req.file = mockFile;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(addEvidenceSpy.calledOnceWith({ fileId: 'someUUID', name: 'name.png' }, req)).to.equal(true);
      expect(redirectStub.calledOnceWith('evidenceUploadPath')).to.equal(true);
    });
  });

  describe('deleteFile', () => {
    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';

      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getEvidenceYesNo('previousPage', { extra: 'model' }, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('Should delete successfully when click on delete link and redirect to the upload-page page', async () => {
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);

      expect(removeEvidenceSpy.calledWith(req.query['id'], req)).to.equal(true);
      expect(redirectStub.calledOnceWith(uploadEvidenceConfig.evidenceUploadPath)).to.equal(true);
    });
  });
});
