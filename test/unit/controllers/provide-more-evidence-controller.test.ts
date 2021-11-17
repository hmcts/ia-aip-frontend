import express, { NextFunction, Request, Response } from 'express';
import { buildAdditionalEvidenceDocumentsSummaryList, deleteProvideMoreEvidence, getConfirmation, getProvideMoreEvidence, postProvideMoreEvidence, setupProvideMoreEvidenceController, submitUploadAdditionalEvidenceEvent, uploadProvideMoreEvidence, validate } from '../../../app/controllers/upload-evidence/provide-more-evidence-controller';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon } from '../../utils/testUtils';

describe('Provide more evidence controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  const file = {
    originalname: 'file.png',
    mimetype: 'type'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = {
      submitEventRefactored: sandbox.stub(),
      updateAppealService: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupProvideMoreEvidenceController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupProvideMoreEvidenceController(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceForm);
      expect(routerPostStub).to.have.been.calledWith(paths.common.provideMoreEvidenceUploadFile);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceDeleteFile);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceCheck);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceConfirmation);
    });
  });

  describe('getProvideMoreEvidence', () => {
    it('should render', () => {
      req.params.id = '1';
      getProvideMoreEvidence(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/multiple-evidence-upload-page.njk');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getProvideMoreEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.called.calledWith(error);
    });
  });

  describe('postProvideMoreEvidence', () => {

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      postProvideMoreEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('uploadProvideMoreEvidence', () => {

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      await uploadProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('submitUploadAdditionalEvidenceEvent', () => {

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      await submitUploadAdditionalEvidenceEvent(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('deleteProvideMoreEvidence', () => {
    it('should delete a document', async () => {
      const deleteEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: '1', url: 'docStoreURLToFile' };
      req.session.appeal.additionalEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.session.appeal.documentMap = [ { ...documentMap } ];
      req.query.id = '1';
      const appeal: Appeal = { ...req.session.appeal };

      await deleteProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.additionalEvidence.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
    });
  });

  describe('getConfirmation', () => {
    it('should render', () => {
      getConfirmation(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk');
    });
  });

  describe('buildAdditionalEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];

      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': [
                  {
                    'href': 'provide-more-evidence',
                    'text': 'Change'
                  }
                ]
              },
              'key': {
                'text': 'Supporting evidence'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>fileName</a>'
              }
            }
          ]
        }
      ];

      const result = buildAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect to \'/provide-more-evidence\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
