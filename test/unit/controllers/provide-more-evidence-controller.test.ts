import express, { NextFunction, Request, Response } from 'express';
import { buildAddendumEvidenceDocumentsSummaryList, buildAdditionalEvidenceDocumentsSummaryList, buildUploadedAdditionalEvidenceDocumentsSummaryList, deleteProvideMoreEvidence, getConfirmation, getEvidenceDocuments, getProvideMoreEvidence, getReasonForLateEvidence, postProvideMoreEvidence, postProvideMoreEvidenceCheckAndSend, postReasonForLateEvidence, setupProvideMoreEvidenceController, uploadProvideMoreEvidence, validate } from '../../../app/controllers/upload-evidence/provide-more-evidence-controller';
import { States } from '../../../app/data/states';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import i18n from '../../../locale/en.json';
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
      expect(routerGetStub).to.have.been.calledWith(paths.common.yourEvidence);
      expect(routerGetStub).to.have.been.calledWith(paths.common.whyEvidenceLate);
      expect(routerPostStub).to.have.been.calledWith(paths.common.whyEvidenceLate);
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

  describe('getReasonForLateEvidence', () => {

    it('should redirect to \'/provide-more-evidence\' with error code, if no document is selected', () => {
      res.locals.errorCode = 'anError';
      req.session.appeal.appealStatus = States.DECIDED.id;
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    });

    it('should redirect to \'/provide-more-evidence-check\' if not addendum evidence', () => {
      req.session.appeal.additionalEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.provideMoreEvidenceCheck);
    });

    it('should render for addendum evidence', () => {
      req.params.id = '1';
      req.session.appeal.appealStatus = States.DECISION.id;
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/reason-for-late-evidence-page.njk');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      req.session.appeal.appealStatus = States.DECISION.id;
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postReasonForLateEvidence', () => {

    it('should redirect to \'/provide-more-evidence\' with error code, if no document is selected', () => {
      res.locals.errorCode = 'anError';
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    });

    it('should redirect to \'/why-evidence-late\' with error code, if no reason for late evidence is provided', () => {
      res.locals.errorCode = 'anError';
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.whyEvidenceLate}?error=reasonForLateEvidence`);
    });

    it('should redirect to \'/provide-more-evidence-check\'', () => {
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.body.whyEvidenceLate = 'Reason for late evidence';
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.provideMoreEvidenceCheck);
    });

    it('should set addendum evidence description with reason for late evidence', () => {
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.body.whyEvidenceLate = 'Reason for late evidence';
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(req.session.appeal.addendumEvidence[0].description).to.equal('Reason for late evidence');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
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

  describe('postProvideMoreEvidenceCheckAndSend', () => {

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      await postProvideMoreEvidenceCheckAndSend(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('deleteProvideMoreEvidence', () => {
    it('should delete an additional document', async () => {
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

    it('should delete an addendum document', async () => {
      const deleteEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: '1', url: 'docStoreURLToFile' };
      req.session.appeal.appealStatus = States.DECIDED.id;
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.session.appeal.documentMap = [ { ...documentMap } ];
      req.query.id = '1';
      const appeal: Appeal = { ...req.session.appeal };

      await deleteProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.addendumEvidence.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
    });
  });

  describe('getConfirmation', () => {
    it('should render', () => {
      getConfirmation(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk');
    });
  });

  describe('getEvidenceDocuments', () => {
    it('should render', () => {
      const summaryList: SummaryList[] = [{ summaryRows: [] }];
      req.session.appeal.additionalEvidenceDocuments = [];
      getEvidenceDocuments(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk',{
        pageTitle: i18n.pages.provideMoreEvidence.yourEvidence.title,
        previousPage: paths.common.overview,
        summaryLists: summaryList
      });
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

  describe('buildAddendumEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format for late evidence', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName',
          description: 'Reason for late evidence'
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
            },
            {
              'actions': {
                'items': [
                  {
                    'href': 'why-evidence-late',
                    'text': 'Change'
                  }
                ]
              },
              'key': {
                'text': 'Reason evidence is late'
              },
              'value': {
                'html': '<p>Reason for late evidence</p>'
              }
            }
          ]
        }
      ];

      const result = buildAddendumEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
      expect(result[0].summaryRows[1].key.text).to.equal(expectedSummaryList[0].summaryRows[1].key.text);
      expect(result[0].summaryRows[1].value.html).to.equal(expectedSummaryList[0].summaryRows[1].value.html);
    });
  });

  describe('buildUploadedAdditionalEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName',
          dateUploaded: 'dateUploaded'
        }
      ];

      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Date uploaded'
              },
              'value': {
                'html': '<p>dateUploaded</p>'
              }
            },
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Document'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>fileName</a>'
              }
            }
          ]
        }
      ];

      const result = buildUploadedAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(paths.common.provideMoreEvidenceForm)(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect to \'/provide-more-evidence\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(paths.common.provideMoreEvidenceForm)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should redirect to \'/why-evidence-late\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(paths.common.whyEvidenceLate)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate(paths.common.provideMoreEvidenceForm)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
