import { NextFunction, Request, Response } from 'express';
import {
  EvidenceUploadConfig,
  getEvidenceYesNo, getSupportingEvidenceDeleteFile,
  getUploadPage,
  postEvidenceYesNo, postUploadFile
} from '../../../app/controllers/upload-evidence/upload-evidence-controller';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('upload evidence controller', () => {

  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const evidence = [];
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const logger: Logger = new Logger();

  let uploadEvidenceConfig: Partial<EvidenceUploadConfig>;

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
    res = {
      locals: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() };
    documentManagementService = { uploadFile: sandbox.stub(), deleteFile: sandbox.stub() };

    uploadEvidenceConfig = {
      evidenceDeletePath: 'evidenceDeletePath',
      evidenceYesNoPath: 'evidenceYesNoPath',
      askForMoreTimeFeatureEnabled: false,
      evidenceUploadPath: 'evidenceUploadPath',
      evidenceSubmitPath: 'evidenceSubmitPath',
      nextPath: 'nextPath',
      getEvidenceFromSessionFunction: () => {
        return evidence;
      },
      addEvidenceToSessionFunction: sandbox.spy(),
      removeEvidenceFromSessionFunction: sandbox.spy()
    } as Partial<EvidenceUploadConfig>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getEvidenceYesNo', () => {
    getEvidenceYesNo('previousPage', { extra: 'model' }, res as Response, next);

    expect(res.render).to.have.been.calledOnce.calledWith('ask-for-more-time/supporting-evidence-yes-or-no.njk', {
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

      expect(res.render).to.have.been.calledOnce.calledWith('ask-for-more-time/supporting-evidence-yes-or-no.njk', {
        errorList: [ expectedError ],
        error: { answer: expectedError },
        previousPage: 'previousPage',
        extra: 'model'
      });
    });

    it('yes have evidence', () => {
      req.body.answer = 'yes';
      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledOnce.calledWith('evidenceUploadPath');
    });

    it('no have evidence', () => {
      req.body.answer = 'no';
      postEvidenceYesNo('previousPage', { extra: 'model' }, uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledOnce.calledWith('nextPath');
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

      expect(res.redirect).to.have.been.calledOnce.calledWith('nextPath');
      expect(uploadEvidenceConfig.removeEvidenceFromSessionFunction).to.have.been.calledWith('fileId', req);
    });
  });

  it('getUploadPage', () => {
    getUploadPage(uploadEvidenceConfig as EvidenceUploadConfig, req as Request, res as Response, next);

    expect(res.render).to.have.been.calledOnce.calledWith('upload-evidence/evidence-upload-page.njk', {
      evidences: evidence,
      evidenceCTA: 'evidenceDeletePath',
      previousPage: 'evidenceYesNoPath',
      askForMoreTimeFeatureEnabled: false,
      pathToUploadEvidence: 'evidenceUploadPath',
      pathToSubmitEvidence: 'evidenceSubmitPath'
    });
  });

  describe('postUploadFile', () => {
    it('Should display validation error when no file has been selected and render upload-evidence/evidence-upload-page.njk', async () => {
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'Select a file'
      };

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('upload-evidence/evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [expectedError],
        evidenceCTA: 'evidenceDeletePath',
        evidences: [],
        pathToSubmitEvidence: 'evidenceSubmitPath',
        pathToUploadEvidence: 'evidenceUploadPath',
        previousPage: 'evidenceYesNoPath',
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should display validation error LIMIT_FILE_TYPE and render upload-evidence/evidence-upload-page.njk ', async () => {
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };

      res.locals.multerError = expectedError.text;

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('upload-evidence/evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidenceCTA: 'evidenceDeletePath',
        evidences: [],
        pathToSubmitEvidence: 'evidenceSubmitPath',
        pathToUploadEvidence: 'evidenceUploadPath',
        previousPage: 'evidenceYesNoPath',
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should display validation error LIMIT_FILE_SIZE and render upload-evidence/evidence-upload-page.njk', async () => {
      // Because the file size is being overriden on the development config for testing purposes
      // error message will show max file size as 0.001MB
      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be smaller than 0.001MB'
      };

      res.locals.multerError = expectedError.text;

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('upload-evidence/evidence-upload-page.njk', {
        error: { uploadFile: expectedError },
        errorList: [ expectedError ],
        evidenceCTA: 'evidenceDeletePath',
        evidences: [],
        pathToSubmitEvidence: 'evidenceSubmitPath',
        pathToUploadEvidence: 'evidenceUploadPath',
        previousPage: 'evidenceYesNoPath',
        askForMoreTimeFeatureEnabled: false
      });
    });

    it('Should succeed render upload-evidence/evidence-upload-page.njk with errors ', async () => {

      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Partial<Express.Multer.File>;

      req.file = mockFile as Express.Multer.File;

      const documentUploadResponse: DocumentUploadResponse = {
        id: 'someEvidenceId',
        fileId: 'someUUID',
        name: 'name.png'
      };

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await postUploadFile(documentManagementService as DocumentManagementService, updateAppealService as UpdateAppealService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(uploadEvidenceConfig.addEvidenceToSessionFunction).to.have.been.calledOnce.calledWith({ fileId: 'someUUID', name: 'name.png' }, req);
      expect(res.redirect).to.have.been.calledOnce.calledWith('evidenceUploadPath');
    });
  });

  describe('deleteFile', () => {
    it('getSupportingEvidenceDeleteFile should catch exception and call next with the error', async () => {
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';

      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('Should delete successfully when click on delete link and redirect to the upload-page page', async () => {
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [ documentMap ];

      req.query['id'] = 'someUUID';
      await getSupportingEvidenceDeleteFile(documentManagementService as DocumentManagementService, uploadEvidenceConfig as EvidenceUploadConfig)(req as Request, res as Response, next);

      expect(uploadEvidenceConfig.removeEvidenceFromSessionFunction).to.have.been.calledWith(req.query['id'], req);
      expect(res.redirect).to.have.been.calledOnce.calledWith(uploadEvidenceConfig.evidenceUploadPath);
    });
  });
});
