import express, { Request, Response } from 'express';
import {
  buildSummaryList,
  deleteEvidence,
  getConfirmation,
  getFtpaCheckAndSend,
  getFtpaOutOfTimeReason,
  getFtpaReason,
  getProvideDocument,
  getProvideEvidenceDocument,
  getProvideFtpaEvidenceQuestion,
  getProvideFtpaOutOfTimeEvidenceQuestion,
  getProvideOutOfTimeEvidenceDocument,
  isFtpaApplicationOutOfTime,
  makeFtpaApplication,
  postFtpaCheckAndSend,
  postFtpaEvidence,
  postFtpaOutOfTimeEvidence,
  postFtpaOutOfTimeReason,
  postFtpaReason,
  postProvideEvidenceQuestion,
  postProvideOutOfTimeEvidenceQuestion,
  setupFtpaApplicationController,
  uploadEvidence
} from '../../../app/controllers/ftpa/ftpa-application';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { formatDate } from '../../../app/utils/date-utils';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Ftpa application controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;
  const finalDecisionAndReasonsDocumentsInTime = [
    {
      fileId: 'fileId',
      name: 'name',
      dateUploaded: formatDate(new Date().toISOString()),
      tag: 'finalDecisionAndReasonsPdf'
    }
  ];
  const finalDecisionAndReasonsDocumentsOutOfTime = [
    {
      fileId: 'fileId',
      name: 'name',
      dateUploaded: '01 January 2022',
      tag: 'finalDecisionAndReasonsPdf'
    }
  ];

  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
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
    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub,
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub();
    updateAppealService = {
      submitEventRefactored: submitStub,
      updateAppealService: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };

  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('makeFtpaApplication', () => {
    it('should clear local ftpa data', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const docs = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ];
      req.session.appeal = {
        ...req.session.appeal,
        'ftpaAppellantGrounds': 'ftpaAppellantGrounds',
        'ftpaAppellantEvidenceDocuments': docs,
        'ftpaAppellantDocuments': docs,
        'ftpaAppellantOutOfTimeExplanation': 'ftpaAppellantOutOfTimeExplanation',
        'ftpaAppellantOutOfTimeDocuments': docs
      };

      await makeFtpaApplication(req as Request, res as Response, next);

      expect(req.session.appeal.ftpaAppellantGrounds).to.equals('');
      expect(req.session.appeal.ftpaAppellantEvidenceDocuments).to.deep.equals([]);
      expect(req.session.appeal.ftpaAppellantDocuments).to.deep.equals([]);
      expect(req.session.appeal.ftpaAppellantOutOfTimeExplanation).to.equals('');
      expect(req.session.appeal.ftpaAppellantOutOfTimeDocuments).to.deep.equals([]);
    });

    it('should redirect to overview page if feature disabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(false);
      await makeFtpaApplication(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.common.overview)).to.equal(true);
    });

    it('should redirect to ftpa reason page when in time application', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        ...finalDecisionAndReasonsDocumentsInTime
      ];

      await makeFtpaApplication(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaReason)).to.equal(true);
    });

    it('should redirect to ftpa out of time reason page when out of time application', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        ...finalDecisionAndReasonsDocumentsOutOfTime
      ];

      await makeFtpaApplication(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaOutOfTimeReason)).to.equal(true);
    });
  });

  describe('getFtpaReason', () => {
    it('should render correctly when in time', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantGrounds = '';

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaReason.title,
        content: i18n.pages.ftpaApplication.ftpaReason.content,
        hint: i18n.pages.ftpaApplication.ftpaReason.hint,
        formSubmitAction: paths.ftpa.ftpaReason,
        reason: req.session.appeal.ftpaAppellantGrounds,
        id: 'ftpaReason',
        previousPage: paths.common.overview
      };

      await getFtpaReason(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/reason-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render correctly when out of time, no evidence', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal = {
        ...req.session.appeal,
        ftpaAppellantGrounds: '',
        ftpaAppellantSubmissionOutOfTime: 'Yes'
      };

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaReason.title,
        content: i18n.pages.ftpaApplication.ftpaReason.content,
        hint: i18n.pages.ftpaApplication.ftpaReason.hint,
        formSubmitAction: paths.ftpa.ftpaReason,
        reason: req.session.appeal.ftpaAppellantGrounds,
        id: 'ftpaReason',
        previousPage: paths.ftpa.ftpaOutOfTimeEvidenceQuestion
      };

      await getFtpaReason(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/reason-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render correctly when out of time with evidence', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal = {
        ...req.session.appeal,
        ftpaAppellantGrounds: '',
        ftpaAppellantSubmissionOutOfTime: 'Yes',
        ftpaOutOfTimeProvideEvidence: 'Yes'
      };

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaReason.title,
        content: i18n.pages.ftpaApplication.ftpaReason.content,
        hint: i18n.pages.ftpaApplication.ftpaReason.hint,
        formSubmitAction: paths.ftpa.ftpaReason,
        reason: req.session.appeal.ftpaAppellantGrounds,
        id: 'ftpaReason',
        previousPage: paths.ftpa.ftpaOutOfTimeEvidence
      };

      await getFtpaReason(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/reason-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should redirect to overview page if feature disabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(false);
      await makeFtpaApplication(req as Request, res as Response, next);

      await getFtpaReason(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.common.overview)).to.equal(true);
    });

    it('should catch an error and redirect with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.render = renderStub.throws(error);

      await getFtpaReason(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getFtpaOutOfTimeReason', () => {
    it('should render correctly', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        ...finalDecisionAndReasonsDocumentsOutOfTime
      ];
      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaOutOfTimeReason.title,
        content: i18n.pages.ftpaApplication.ftpaOutOfTimeReason.content,
        hint: i18n.pages.ftpaApplication.ftpaOutOfTimeReason.hint,
        formSubmitAction: paths.ftpa.ftpaOutOfTimeReason,
        reason: req.session.appeal.ftpaAppellantOutOfTimeExplanation,
        id: 'ftpaOutOfTimeReason',
        ftpaDeadline: '15 January 2022',
        previousPage: paths.common.overview
      };

      await getFtpaOutOfTimeReason(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/reason-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should redirect to overview page if feature disabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(false);

      await makeFtpaApplication(req as Request, res as Response, next);

      await getFtpaOutOfTimeReason(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.common.overview)).to.equal(true);
    });

    it('should catch an error and redirect with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        ...finalDecisionAndReasonsDocumentsOutOfTime
      ];
      const error = new Error('the error');
      res.render = renderStub.throws(error);

      await getFtpaOutOfTimeReason(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postFtpaReason', () => {

    it('should redirect to provide evidence question page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.body['ftpaReason'] = 'Grounds for ftpa application';

      postFtpaReason(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaEvidenceQuestion)).to.equal(true);
    });

    it('should redirect to reason-for-application-page with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      postFtpaReason(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaReason}?error=ftpaReason`)).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postFtpaReason(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postFtpaOutOfTimeReason', () => {

    it('should redirect to provide evidence question page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.body['ftpaOutOfTimeReason'] = 'Reason for late ftpa application';

      postFtpaOutOfTimeReason(req as Request, res as Response, next);

      expect(req.session.appeal.ftpaAppellantOutOfTimeExplanation).to.eq('Reason for late ftpa application');
      expect(redirectStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidenceQuestion)).to.equal(true);
    });

    it('should redirect to reason-for-out-of-time-application page with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      postFtpaOutOfTimeReason(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaOutOfTimeReason}?error=ftpaOutOfTimeReason`)).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postFtpaOutOfTimeReason(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getProvideFtpaEvidenceQuestion', () => {
    it('should render evidence-question-page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaProvideEvidence = 'Yes';
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
        previousPage: paths.ftpa.ftpaReason,
        pageTitle: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
        formAction: paths.ftpa.ftpaEvidenceQuestion,
        question,
        saveAndContinue: false
      };

      getProvideFtpaEvidenceQuestion(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/evidence-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getProvideFtpaEvidenceQuestion(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getProvideFtpaOutOfTimeEvidenceQuestion', () => {
    it('should render evidence-question-page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaOutOfTimeProvideEvidence = 'Yes';
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
        previousPage: paths.ftpa.ftpaOutOfTimeReason,
        pageTitle: i18n.pages.ftpaApplication.ftpaEvidenceQuestion.title,
        formAction: paths.ftpa.ftpaOutOfTimeEvidenceQuestion,
        question,
        saveAndContinue: false
      };

      getProvideFtpaOutOfTimeEvidenceQuestion(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/evidence-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getProvideFtpaOutOfTimeEvidenceQuestion(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postProvideEvidenceQuestion', () => {

    it('should redirect to provide evidence document page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.body['answer'] = 'Yes';

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaEvidence)).to.equal(true);
    });

    it('should redirect to check your answer page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.body['answer'] = 'No';

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaCheckAndSend)).to.equal(true);
    });

    it('should redirect to evidence-question-page with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaEvidenceQuestion}?error=ftpaEvidenceQuestion`)).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postProvideEvidenceQuestion(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postProvideOutOfTimeEvidenceQuestion', () => {

    it('should redirect to provide evidence document page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.body['answer'] = 'Yes';

      postProvideOutOfTimeEvidenceQuestion(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidence)).to.equal(true);
    });

    it('should redirect to ftpa reason page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.body['answer'] = 'No';

      postProvideOutOfTimeEvidenceQuestion(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaReason)).to.equal(true);
    });

    it('should redirect to out of time evidence-question-page with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      postProvideOutOfTimeEvidenceQuestion(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaOutOfTimeEvidenceQuestion}?error=ftpaEvidenceQuestion`)).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postProvideOutOfTimeEvidenceQuestion(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getProvideDocument', () => {
    it('should render with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.query.error = 'noFileSelected';
      const errorList = [{ key: 'file-upload', text: 'Select a file', href: '#file-upload' }];
      const error = {
        uploadFile: {
          key: 'file-upload',
          text: 'Select a file',
          href: '#file-upload'
        }
      };

      const config = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
        adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
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
      expect(renderStub).to.be.calledWith('ftpa-application/document-upload-page.njk', {
        ...expectedRenderPayload
      });
    });
  });

  describe('getProvideEvidenceDocument', () => {
    it('should render evidence document upload page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
        adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
        adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
        evidenceUploadAction: paths.ftpa.ftpaEvidenceUploadFile,
        evidences: [],
        evidenceCTA: paths.ftpa.ftpaEvidenceDeleteFile,
        previousPage: paths.ftpa.ftpaEvidenceQuestion,
        formSubmitAction: paths.ftpa.ftpaEvidence
      };

      getProvideEvidenceDocument(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/document-upload-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getProvideEvidenceDocument(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getProvideOutOfTimeEvidenceDocument', () => {
    it('should render out of time evidence document upload page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const expectedRenderPayload = {
        title: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.title,
        adviceHeader: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.adviceHeader,
        adviceList: i18n.pages.ftpaApplication.ftpaDocumentUpload.ftpaEvidence.advice,
        evidenceUploadAction: paths.ftpa.ftpaOutOfTimeEvidenceUploadFile,
        evidences: req.session.appeal.ftpaAppellantOutOfTimeDocuments || [],
        evidenceCTA: paths.ftpa.ftpaOutOfTimeEvidenceDeleteFile,
        previousPage: paths.ftpa.ftpaOutOfTimeEvidenceQuestion,
        formSubmitAction: paths.ftpa.ftpaOutOfTimeEvidence
      };

      getProvideOutOfTimeEvidenceDocument(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('ftpa-application/document-upload-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getProvideOutOfTimeEvidenceDocument(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postFtpaEvidence', () => {

    it('should redirect to check-and-send-page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantEvidenceDocuments = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ];

      postFtpaEvidence(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaCheckAndSend)).to.equal(true);
    });

    it('should redirect to evidence document upload page with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      postFtpaEvidence(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaEvidence}?error=noFileSelected`)).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postFtpaEvidence(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('postFtpaOutOfTimeEvidence', () => {

    it('should redirect to ftpa-reason-page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantOutOfTimeDocuments = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ];

      postFtpaOutOfTimeEvidence(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaReason)).to.equal(true);
    });

    it('should redirect to evidence document upload page with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      postFtpaOutOfTimeEvidence(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaOutOfTimeEvidence}?error=noFileSelected`)).to.equal(true);
    });

    it('should catch an error and redirect with error', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);

      postFtpaOutOfTimeEvidence(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('uploadEvidence', () => {
    it('should upload evidence successfully', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

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
      req.session.appeal.documentMap = [documentMap];
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await uploadEvidence(
        documentManagementService as DocumentManagementService,
        'ftpaEvidence',
        'ftpaAppellantEvidenceDocuments')(req as Request, res as Response, next);

      expect((req.session.appeal.ftpaAppellantEvidenceDocuments || [])[0].fileId === documentUploadResponse.fileId);
      expect((req.session.appeal.ftpaAppellantEvidenceDocuments || [])[0].name === documentUploadResponse.name);
      expect(redirectStub.calledWith(paths.ftpa.ftpaEvidence)).to.equal(true);
    });

    it('should redirect with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      await uploadEvidence(
        documentManagementService as DocumentManagementService,
        'ftpaEvidence',
        'ftpaAppellantEvidenceDocuments')(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.ftpa.ftpaEvidence}?error=noFileSelected`)).to.equal(true);
    });
  });

  describe('deleteEvidence', () => {
    it('should delete evidence successfully', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantEvidenceDocuments = [{ fileId: '1', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: '1', url: 'docStoreURLToFile' }];
      req.query.id = '1';

      await deleteEvidence(
        documentManagementService as DocumentManagementService,
        'ftpaEvidence',
        'ftpaAppellantEvidenceDocuments')(req as Request, res as Response, next);

      expect(req.session.appeal.ftpaAppellantEvidenceDocuments.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
      expect(redirectStub.calledWith(paths.ftpa.ftpaEvidence)).to.equal(true);
    });
  });

  describe('getFtpaCheckAndSend', () => {
    it('should render when in time', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaProvideEvidence = 'Yes';

      const previousPage = paths.ftpa.ftpaEvidence;
      const summaryLists: SummaryList[] = [{ summaryRows: [] }];

      const expectedRenderPayload = {
        pageTitle: i18n.pages.ftpaApplication.checkYourAnswers.title,
        continuePath: paths.ftpa.ftpaCheckAndSend,
        previousPage,
        summaryLists
      };
      getFtpaCheckAndSend(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('templates/check-and-send.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render when no supporting evidence', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaProvideEvidence = 'No';

      const previousPage = paths.ftpa.ftpaEvidenceQuestion;
      const summaryLists: SummaryList[] = [{ summaryRows: [] }];

      const expectedRenderPayload = {
        pageTitle: i18n.pages.ftpaApplication.checkYourAnswers.title,
        continuePath: paths.ftpa.ftpaCheckAndSend,
        previousPage,
        summaryLists
      };
      getFtpaCheckAndSend(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('templates/check-and-send.njk', {
        ...expectedRenderPayload
      });
    });
  });

  describe('postFtpaCheckAndSend', () => {
    it('should submit application successfully when in time', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const evidence = [
        {
          id: 'docId',
          fileId: 'fileId',
          name: 'ftpaDoc',
          tag: 'ftpaAppellant'
        }
      ] as Evidence[];
      req.session.appeal.ftpaProvideEvidence = 'Yes';
      req.session.appeal.ftpaAppellantGrounds = 'Reason for ftpa application';
      req.session.appeal.ftpaAppellantEvidenceDocuments = evidence;
      req.session.appeal.ftpaAppellantOutOfTimeDocuments = evidence;

      await postFtpaCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.ftpa.ftpaConfirmation)).to.equal(true);
      expect(req.session.appeal.ftpaProvideEvidence).to.eq(undefined);
      expect(req.session.appeal.ftpaOutOfTimeProvideEvidence).to.eq(undefined);
    });
  });

  describe('getConfirmation', () => {
    it('should render confirmation-page', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      getConfirmation(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.ftpaApplication.ftpaConfirmation.title,
        whatNextListItems: i18n.pages.ftpaApplication.ftpaConfirmation.whatNextListItems
      });
    });
  });

  describe('isFtpaApplicationOutOfTime', () => {
    it('should return true when application is made out of time', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: 'fileId',
          name: 'name',
          dateUploaded: '01 January 2022',
          tag: 'finalDecisionAndReasonsPdf'
        }
      ];

      expect(isFtpaApplicationOutOfTime(req as Request)).to.equal(true);
    });

    it('should return false when application is made in time', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.finalDecisionAndReasonsDocuments = [
        {
          fileId: 'fileId',
          name: 'name',
          dateUploaded: formatDate(new Date().toString()),
          tag: 'finalDecisionAndReasonsPdf'
        }
      ];

      expect(isFtpaApplicationOutOfTime(req as Request)).to.equal(false);
    });
  });

  describe('buildSummaryList', () => {
    const mockEvidenceDocuments: Evidence[] = [
      {
        fileId: 'aFileId',
        name: 'fileName'
      },
      {
        fileId: 'aFileId1',
        name: 'fileName1'
      }
    ];
    it('should return summary list with supporting evidence', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantEvidenceDocuments = mockEvidenceDocuments;
      req.session.appeal.ftpaAppellantGrounds = 'Grounds for ftpa application';

      const result = buildSummaryList(req as Request);

      expect(result[0].summaryRows).to.be.lengthOf(2);
    });

    it('should return summary list without supporting evidence', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantGrounds = 'Grounds for ftpa application';

      const result = buildSummaryList(req as Request);

      expect(result[0].summaryRows).to.be.lengthOf(1);
    });

    it('should return out of time summary list with supporting evidence', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantEvidenceDocuments = mockEvidenceDocuments;
      req.session.appeal.ftpaAppellantGrounds = 'Grounds for ftpa application';
      req.session.appeal.ftpaAppellantOutOfTimeExplanation = 'Out of time explanations';
      req.session.appeal.ftpaAppellantOutOfTimeDocuments = mockEvidenceDocuments;

      const result = buildSummaryList(req as Request);

      expect(result[0].summaryRows).to.be.lengthOf(4);
    });

    it('should return out of time summary list without supporting evidence', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      req.session.appeal.ftpaAppellantGrounds = 'Grounds for ftpa application';
      req.session.appeal.ftpaAppellantOutOfTimeExplanation = 'Out of time explanations';
      req.session.appeal.ftpaAppellantOutOfTimeDocuments = mockEvidenceDocuments;

      const result = buildSummaryList(req as Request);

      expect(result[0].summaryRows).to.be.lengthOf(3);
    });
  });

  describe('setupAppealRequestControllers', () => {
    it('should setup routes', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ftpa-feature', false).resolves(true);

      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupFtpaApplicationController(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);

      expect(routerGetStub.calledWith(paths.ftpa.ftpaReason)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaOutOfTimeReason)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaEvidenceQuestion)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidenceQuestion)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaEvidence)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidence)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaCheckAndSend)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaConfirmation)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaApplication)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaEvidenceDeleteFile)).to.equal(true);
      expect(routerGetStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidenceDeleteFile)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaEvidence)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidence)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaReason)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaOutOfTimeReason)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaEvidenceQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidenceQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaEvidenceUploadFile)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaOutOfTimeEvidenceUploadFile)).to.equal(true);
      expect(routerPostStub.calledWith(paths.ftpa.ftpaCheckAndSend)).to.equal(true);
    });
  });
});
