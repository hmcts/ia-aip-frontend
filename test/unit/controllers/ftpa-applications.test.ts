import express, { NextFunction, Request, Response } from 'express';
import {
  buildSummaryList,
  deleteEvidence, getConfirmation, getFtpaCheckAndSend,
  getFtpaReason, getProvideDocument, getProvideEvidenceDocument,
  getProvideEvidenceQuestion, getProvideGroundsDocument, isFtpaApplicationOutOfTime,
  makeFtpaApplication, postFtpaCheckAndSend, postFtpaEvidence, postFtpaGrounds,
  postFtpaReason, postProvideEvidenceQuestion, setupFtpaApplicationController, uploadEvidence
} from '../../../app/controllers/ftpa/ftpa-application';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import LaunchDarklyService from '../service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { formatDate } from '../../../app/utils/date-utils';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Ftpa application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

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

    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('makeFtpaApplication', () => {
    it('should redirect to overview page if feature disabled', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(false);
      makeFtpaApplication(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should redirect to ftpa reason page when in time application', () => {
      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: 'fileId',
          name: 'name',
          dateUploaded: formatDate(new Date().toString()),
          tag: 'finalDecisionAndReasonsPdf'
        }
      ];

      makeFtpaApplication(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaReason);
    });

    it('should redirect to ftpa out of time reason page when out of time application', () => {
      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: 'fileId',
          name: 'name',
          dateUploaded: '01 January 2022',
          tag: 'finalDecisionAndReasonsPdf'
        }
      ];

      makeFtpaApplication(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaOutOfTimereason);
    });
  });

  describe('getFtpaReason', () => {
    it('should render reason-for-application-page', () => {

      req.session.appeal.ftpaReason = '';

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaReason.title,
        content: i18n.pages.ftpaApplication.ftpaReason.content,
        hint: i18n.pages.ftpaApplication.ftpaReason.hint,
        formSubmitAction: paths.ftpa.ftpaReason,
        ftpaReason: req.session.appeal.ftpaReason,
        id: 'ftpaReason',
        previousPage: paths.common.overview
      };

      getFtpaReason(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/reason-for-application-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should redirect to overview page is feature disabled', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(false);
      makeFtpaApplication(req as Request, res as Response, next);

      getFtpaReason(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getFtpaReason(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postFtpaReason', () => {

    it('should redirect to provide grounds document page', () => {
      req.body['ftpaReason'] = 'Grounds for ftpa application';

      postFtpaReason(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaGrounds);
    });

    it('should redirect to reason-for-application-page with error', () => {
      postFtpaReason(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.ftpa.ftpaReason}?error=ftpaReason`);
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postFtpaReason(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getProvideEvidenceQuestion', () => {
    it('should render evidence-question-page', () => {

      req.session.appeal.ftpaProvideEvidence = 'yes';
      const question = {
        title: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
        name: 'answer',
        titleIsheading: true,
        options: [
          {
            value: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.value,
            text: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.yes.text,
            checked: true
          },
          {
            value: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.no.value,
            text: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.options.no.text,
            checked: false
          }
        ],
        inline: true
      };

      const expectedRenderPayload = {
        previousPage: paths.ftpa.ftpaGrounds,
        pageTitle: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
        formAction: paths.ftpa.ftpaEvidenceQuestion,
        question,
        saveAndContinue: false
      };

      getProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/evidence-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postProvideEvidenceQuestion', () => {

    it('should redirect to provide evidence document page', () => {
      req.body['answer'] = 'yes';

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaEvidence);
    });

    it('should redirect to check your answer page', () => {
      req.body['answer'] = 'no';

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaCheckAndSend);
    });

    it('should redirect to evidence-question-page with error', () => {
      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.ftpa.ftpaEvidenceQuestion}?error=ftpaEvidenceQuestion`);
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getProvideDocument', () => {
    it('should render grounds document upload page', () => {

      const config = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaGrounds.title,
        adviceHeader: undefined,
        advice: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaGrounds.advice,
        adviceList: undefined,
        evidenceUploadAction: paths.ftpa.ftpaGroundsUploadFile,
        evidences: [],
        evidenceCTA: paths.ftpa.ftpaGroundsDeleteFile,
        previousPage: paths.ftpa.ftpaReason,
        formSubmitAction: paths.ftpa.ftpaGrounds
      };

      getProvideDocument(req as Request, res as Response, next, config);

      expect(res.render).to.have.been.calledWith('ftpa-application/document-upload-page.njk', {
        ...config
      });
    });

    it('should render evidence document upload page', () => {

      const config = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
        adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
        advice: undefined,
        adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
        evidenceUploadAction: paths.ftpa.ftpaEvidenceUploadFile,
        evidences: [],
        evidenceCTA: paths.ftpa.ftpaEvidenceDeleteFile,
        previousPage: paths.ftpa.ftpaEvidenceQuestion,
        formSubmitAction: paths.ftpa.ftpaEvidence
      };

      getProvideDocument(req as Request, res as Response, next, config);

      expect(res.render).to.have.been.calledWith('ftpa-application/document-upload-page.njk', {
        ...config
      });
    });

    it('should render with error', () => {
      req.query.error = 'noFileSelected';
      const errorList = [{ key: 'uploadFile', text: 'Select a file', href: '#uploadFile' }];
      const error = {
        uploadFile: {
          key: 'uploadFile',
          text: 'Select a file',
          href: '#uploadFile'
        }
      };

      const config = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
        adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
        advice: undefined,
        adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
        evidenceUploadAction: paths.ftpa.ftpaEvidenceUploadFile,
        evidences: [],
        evidenceCTA: paths.ftpa.ftpaEvidenceDeleteFile,
        previousPage: paths.ftpa.ftpaEvidenceQuestion,
        formSubmitAction: paths.ftpa.ftpaEvidence
      };

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
        adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
        advice: undefined,
        adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
        evidenceUploadAction: paths.ftpa.ftpaEvidenceUploadFile,
        evidences: [],
        evidenceCTA: paths.ftpa.ftpaEvidenceDeleteFile,
        previousPage: paths.ftpa.ftpaEvidenceQuestion,
        errorList,
        error,
        formSubmitAction: paths.ftpa.ftpaEvidence
      };
      getProvideDocument(req as Request, res as Response, next, config);
      expect(res.render).to.have.been.calledWith('ftpa-application/document-upload-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      getProvideGroundsDocument(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  it('should catch an error and redirect with error', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);

    getProvideEvidenceDocument(req as Request, res as Response, next);

    expect(next).to.have.been.calledWith(error);
  });

  describe('postFtpaEvidence', () => {

    it('should redirect to check-and-send-page', () => {
      req.session.appeal.ftpaAppellantEvidenceDocuments = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ];

      postFtpaEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaCheckAndSend);
    });

    it('should redirect to evidence document upload page with error', () => {
      postFtpaEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.ftpa.ftpaEvidence}?error=noFileSelected`);
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postFtpaEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postFtpaGrounds', () => {

    it('should redirect to evidence-question-page', () => {
      req.session.appeal.ftpaAppellantGroundsDocuments = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ];

      postFtpaGrounds(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaEvidenceQuestion);
    });

    it('should redirect to grounds document upload page with error', () => {
      postFtpaGrounds(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.ftpa.ftpaGrounds}?error=noFileSelected`);
    });

    it('should catch an error and redirect with error', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      postFtpaGrounds(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('uploadEvidence', () => {
    it('should upload evidence successfully', async () => {
      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Partial<Express.Multer.File>;
      req.file = mockFile as Express.Multer.File;
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [documentMap];
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await uploadEvidence(
          documentManagementService as DocumentManagementService,
          'ftpaEvidence',
          'ftpaAppellantEvidenceDocuments')(req as Request, res as Response, next);

      expect((req.session.appeal.ftpaAppellantEvidenceDocuments || [])[0].fileId === documentUploadResponse.fileId);
      expect((req.session.appeal.ftpaAppellantEvidenceDocuments || [])[0].name === documentUploadResponse.name);
      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaEvidence);
    });

    it('should redirect with error', async () => {

      await uploadEvidence(
          documentManagementService as DocumentManagementService,
          'ftpaEvidence',
          'ftpaAppellantEvidenceDocuments')(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.ftpa.ftpaEvidence}?error=noFileSelected`);
    });
  });

  describe('deleteEvidence', () => {
    it('should delete evidence successfully', async () => {

      req.session.appeal.ftpaAppellantGroundsDocuments = [{ fileId: '1', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: '1', url: 'docStoreURLToFile' }];
      req.query.id = '1';

      await deleteEvidence(
          documentManagementService as DocumentManagementService,
          'ftpaGrounds',
          'ftpaAppellantGroundsDocuments')(req as Request, res as Response, next);

      expect(req.session.appeal.ftpaAppellantGroundsDocuments.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaGrounds);
    });
  });

  describe('getFtpaCheckAndSend', () => {
    it('should render', () => {
      req.session.appeal.ftpaProvideEvidence = 'yes';

      const previousPage = paths.ftpa.ftpaEvidence;
      const summaryLists: SummaryList[] = [{ summaryRows: [] }];

      const expectedRenderPayload = {
        pageTitle: i18n.pages.ftpaApplication.checkYourAnswers.title,
        continuePath: paths.ftpa.ftpaCheckAndSend,
        previousPage,
        summaryLists
      };
      getFtpaCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render when no supporting evidence', () => {
      req.session.appeal.ftpaProvideEvidence = 'no';

      const previousPage = paths.ftpa.ftpaEvidenceQuestion;
      const summaryLists: SummaryList[] = [{ summaryRows: [] }];

      const expectedRenderPayload = {
        pageTitle: i18n.pages.ftpaApplication.checkYourAnswers.title,
        continuePath: paths.ftpa.ftpaCheckAndSend,
        previousPage,
        summaryLists
      };
      getFtpaCheckAndSend(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', {
        ...expectedRenderPayload
      });
    });
  });

  describe('postFtpaCheckAndSend', () => {
    it('should submit application successfully', async () => {

      const evidence = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ] as Evidence[];
      req.session.appeal.ftpaProvideEvidence = 'yes';
      req.session.appeal.ftpaReason = 'Reason for ftpa application';
      req.session.appeal.ftpaAppellantEvidenceDocuments = evidence;
      req.session.appeal.ftpaAppellantGroundsDocuments = evidence;

      await postFtpaCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.ftpa.ftpaConfirmation);
      expect(req.session.appeal.ftpaAppellantEvidenceDocuments.length).to.eq(0);
      expect(req.session.appeal.ftpaAppellantGroundsDocuments.length).to.eq(0);
      expect(req.session.appeal.ftpaProvideEvidence).to.eq(undefined);
      expect(req.session.appeal.ftpaReason).to.eq(undefined);
    });
  });

  describe('getConfirmation', () => {
    it('should render confirmation-page', () => {

      getConfirmation(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.ftpaApplication.ftpaConfirmation.title,
        whatNextListItems: i18n.pages.ftpaApplication.ftpaConfirmation.whatNextListItems
      });
    });
  });

  describe('isFtpaApplicationOutOfTime', () => {
    it('should return true when application is made out of time', () => {

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: 'fileId',
          name: 'name',
          dateUploaded: '01 January 2022',
          tag: 'finalDecisionAndReasonsPdf'
        }
      ];

      expect(isFtpaApplicationOutOfTime(req as Request)).to.be.true;
    });

    it('should return false when application is made in time', () => {

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: 'fileId',
          name: 'name',
          dateUploaded: formatDate(new Date().toString()),
          tag: 'finalDecisionAndReasonsPdf'
        }
      ];

      expect(isFtpaApplicationOutOfTime(req as Request)).to.be.false;
    });
  });

  describe('buildSummaryList', () => {
    it('should return summary list with supporting evidence', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.ftpaAppellantEvidenceDocuments = mockEvidenceDocuments;
      req.session.appeal.ftpaAppellantGroundsDocuments = mockEvidenceDocuments;
      req.session.appeal.ftpaReason = 'Grounds for ftpa application';

      const result = buildSummaryList(req as Request);

      expect(result[0].summaryRows).to.be.lengthOf(3);
    });

    it('should return summary list without supporting evidence', () => {
      req.session.appeal.ftpaAppellantGroundsDocuments = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.ftpaReason = 'Grounds for ftpa application';

      const result = buildSummaryList(req as Request);

      expect(result[0].summaryRows).to.be.lengthOf(2);
    });
  });

  describe('setupAppealRequestControllers', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupFtpaApplicationController(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);

      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaReason);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaEvidenceQuestion);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaGrounds);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaEvidence);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaCheckAndSend);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaConfirmation);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaApplication);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaEvidenceDeleteFile);
      expect(routerGetStub).to.have.been.calledWith(paths.ftpa.ftpaGroundsDeleteFile);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaGrounds);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaReason);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaEvidenceQuestion);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaEvidenceUploadFile);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaEvidence);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaGroundsUploadFile);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaEvidence);
      expect(routerPostStub).to.have.been.calledWith(paths.ftpa.ftpaCheckAndSend);
    });
  });
});
