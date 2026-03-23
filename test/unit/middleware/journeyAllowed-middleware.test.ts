import { Request, Response } from 'express';
import session from 'express-session';
import { States } from '../../../app/data/states';
import {
  isJourneyAllowedMiddleware,
  isTimeExtensionsInProgress
} from '../../../app/middleware/journeyAllowed-middleware';
import { paths } from '../../../app/paths';
import { expect, sinon } from '../../utils/testUtils';

describe('isJourneyAllowedMiddleware', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<session.Session>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {}
      } as any
    } as Partial<Request>;
    redirectStub = sandbox.stub();
    res = {
      render: sandbox.stub(),
      redirect: redirectStub,
      clearCookie: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should allow access to page', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    const reqWithPath = { ...req, path: paths.appealStarted.name } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should allow access to page with params', () => {
    req.params.id = '3';
    req.session.appeal.appealStatus = 'awaitingClarifyingQuestionsAnswers';
    const reqWithPath = {
      ...req,
      path: paths.awaitingClarifyingQuestionsAnswers.question.replace(':id', '3')
    } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should allow access to page with params', () => {
    req.session.appeal.appealStatus = 'decided';
    const reqWithPath = { ...req, path: paths.ftpa.ftpaApplication } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should render forbidden page when page not available for that state', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    const reqWithPath = { ...req, path: paths.appealSubmitted.confirmation } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(redirectStub.calledWith(paths.common.forbidden)).to.equal(true);
  });

  describe('Non legal rep common pages', () => {
    const forbiddenCommonPaths: string[] = [
      paths.common.changeRepresentation,
      paths.common.changeRepresentationDownload,
      paths.common.askForMoreTimeReason,
      paths.common.askForMoreTimeCancel,
      paths.common.askForMoreTimeSupportingEvidence,
      paths.common.askForMoreTimeSupportingEvidenceUpload,
      paths.common.askForMoreTimeSupportingEvidenceSubmit,
      paths.common.askForMoreTimeSupportingEvidenceDelete,
      paths.common.askForMoreTimeCheckAndSend,
      paths.common.askForMoreTimeConfirmation,
      paths.common.provideMoreEvidenceForm,
      paths.common.provideMoreEvidenceUploadFile,
      paths.common.provideMoreEvidenceDeleteFile,
      paths.common.provideMoreEvidenceCheck,
      paths.common.provideMoreEvidenceConfirmation,
      paths.common.yourEvidence,
      paths.common.yourAddendumEvidence,
      paths.common.lrEvidence,
      paths.common.homeOfficeAddendumEvidence,
      paths.common.newEvidence,
      paths.common.whyEvidenceLate,
      paths.common.finishPayment,
      paths.common.payLater,
      paths.common.payImmediately,
      paths.common.confirmationPayment,
      paths.common.clarifyingQuestionsAnswersSentConfirmation
    ];
    const permittedCommonPaths: string[] = [
      paths.common.index,
      paths.common.login,
      paths.common.logout,
      paths.common.redirectUrl,
      paths.common.start,
      paths.common.overview,
      paths.common.fileNotFound,
      paths.common.yourCQanswers,
      paths.common.health,
      paths.common.liveness,
      paths.common.healthLiveness,
      paths.common.healthReadiness,
      paths.common.ineligible,
      paths.common.questions,
      paths.common.eligible,
      paths.common.documentViewer,
      paths.common.homeOfficeDocumentsViewer,
      paths.common.appealDetailsViewer,
      paths.common.reasonsForAppealViewer,
      paths.common.lrReasonsForAppealViewer,
      paths.common.makeAnApplicationViewer,
      paths.common.timeExtensionDecisionViewer,
      paths.common.cmaRequirementsAnswerViewer,
      paths.common.noticeEndedAppealViewer,
      paths.common.outOfTimeDecisionViewer,
      paths.common.homeOfficeWithdrawLetter,
      paths.common.homeOfficeResponse,
      paths.common.hearingNoticeViewer,
      paths.common.latestHearingNoticeViewer,
      paths.common.hearingAdjournmentNoticeViewer,
      paths.common.hearingBundleViewer,
      paths.common.decisionAndReasonsViewer,
      paths.common.decisionAndReasonsViewerWithRule32,
      paths.common.ftpaAppellantApplicationViewer,
      paths.common.ftpaDecisionViewer,
      paths.common.directionHistoryViewer,
      paths.common.updatedDecisionAndReasonsViewer,
      paths.common.remittalDocumentsViewer,
      paths.common.extendSession,
      paths.common.sessionExpired,
      paths.common.forbidden,
      paths.common.tribunalCaseworker,
      paths.common.moreHelp,
      paths.common.evidenceToSupportAppeal,
      paths.common.whatIsIt,
      paths.common.gettingStarted,
      paths.common.documents,
      paths.common.fourStages,
      paths.common.giveFeedback,
      paths.common.notifications,
      paths.common.howToHelp,
      paths.common.guidance,
      paths.common.offlineProcesses,
      paths.common.homeOfficeDocuments,
      paths.common.whatToExpectAtCMA,
      paths.common.whatToExpectAtHearing,
      paths.common.understandingHearingBundle,
      paths.common.homeOfficeMaintainDecision,
      paths.common.homeOfficeWithdrawDecision,
      paths.common.clarifyingQuestionsAnswersSentConfirmation,
      paths.common.cookies,
      paths.common.termsAndConditions,
      paths.common.privacyPolicy,
      paths.common.accessibility
    ];
    it('should render forbidden to forbidden common pages for Non legal rep', () => {
      req.session.isNonLegalRep = true;
      const forbiddenPaths: string[] = Object.values(paths.common).filter(path => !permittedCommonPaths.includes(path));
      for (const path of forbiddenPaths) {
        redirectStub = sandbox.stub();
        res.redirect = redirectStub;
        const reqWithPath = { ...req, path } as Request;
        isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
        expect(redirectStub.calledOnceWith(paths.common.forbidden)).to.equal(true, `Expected to forbid access to ${path} for Non legal rep but was allowed`);
      }
    });

    it('should allow permitted common pages for Non legal rep', () => {
      req.session.isNonLegalRep = true;
      const permittedPaths: string[] = Object.values(paths.common).filter(path => !forbiddenCommonPaths.includes(path));
      for (const path of permittedPaths) {
        next = sandbox.stub();
        const reqWithPath = { ...req, path } as Request;
        isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
        expect(next.calledOnceWith()).to.equal(true, `Expected to allow access to ${path} for Non legal rep but was forbidden`);
      }
    });
  });

  it('should render forbidden page for Non legal rep for appealStatusPaths', () => {
    req.session.isNonLegalRep = true;
    for (const state in States) {
      const status = States[state].id;
      req.session.appeal.appealStatus = status;
      for (const path in paths[status]) {
        redirectStub = sandbox.stub();
        res.redirect = redirectStub;
        const reqWithPath = { ...req, path: paths[status][path] } as Request;
        isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
        expect(redirectStub.calledOnceWith(paths.common.forbidden)).to.equal(true, `Expected to forbid access to ${paths[status][path]} for Non legal rep but was allowed when appeal status is ${status}`);
      }
    }
  });

  it('should render forbidden page for Non legal rep for makeApplicationPaths', () => {
    req.session.appeal.appealStatus = 'decided';
    req.session.isNonLegalRep = true;
    for (const path in paths.makeApplication) {
      redirectStub = sandbox.stub();
      res.redirect = redirectStub;
      const reqWithPath = { ...req, path: path } as Request;
      isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.forbidden)).to.equal(true, `Expected to forbid access to ${path} for Non legal rep but was allowed`);
    }
  });

  describe('nonLegalRepPaths', () => {
    const allowedPaths: string[] = [
      paths.nonLegalRep.joinAppeal,
      paths.nonLegalRep.joinAppealConfirmation,
      paths.nonLegalRep.joinAppealConfirmDetails,
      paths.nonLegalRep.updateName,
      paths.nonLegalRep.updateAddress,
      paths.nonLegalRep.updateContactDetails,
      paths.nonLegalRep.updateDetailsCheckAndSend,
      paths.nonLegalRep.updateDetailsConfirmation
    ];
    it('should render forbidden page for Non legal rep for nonLegalRepPaths', () => {
      req.session.appeal.appealStatus = 'decided';
      req.session.isNonLegalRep = true;
      const forbiddenPaths: string[] = Object.values(paths.nonLegalRep).filter(path => !allowedPaths.includes(path));
      for (const path of forbiddenPaths) {
        redirectStub = sandbox.stub();
        res.redirect = redirectStub;
        const reqWithPath = { ...req, path: path } as Request;
        isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
        expect(redirectStub.calledOnceWith(paths.common.forbidden)).to.equal(true, `Expected to forbid access to ${path} for Non legal rep but was allowed`);
      }
    });

    it('should allow access for Non legal rep for allowed paths in nonLegalRepPaths', () => {
      req.session.appeal.appealStatus = 'decided';
      req.session.isNonLegalRep = true;
      for (const path of allowedPaths) {
        next = sandbox.stub();
        const reqWithPath = { ...req, path: path } as Request;
        isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
        expect(next.calledOnceWith()).to.equal(true, `Expected to allow access to ${path} for Non legal rep but was forbidden`);
      }
    });
  });

  it('should render forbidden page for Non legal rep for ftpaPaths', () => {
    req.session.appeal.appealStatus = 'decided';
    req.session.isNonLegalRep = true;
    for (const path in paths.ftpa) {
      redirectStub = sandbox.stub();
      res.redirect = redirectStub;
      const reqWithPath = { ...req, path: path } as Request;
      isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.forbidden)).to.equal(true, `Expected to forbid access to ${path} for Non legal rep but was allowed`);
    }
  });

  it('should allow access to document viewer', () => {
    req.session.appeal.appealStatus = 'appealStarted';
    const reqWithPath = { ...req, path: paths.common.documentViewer + 'someFileName' } as Request;
    isJourneyAllowedMiddleware(reqWithPath, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should render forbidden if time extension in progress', () => {
    req.session.appeal.makeAnApplications = [{
      id: '1',
      value: {
        applicant: 'Appellant',
        applicantRole: 'citizen',
        date: '2021-07-15',
        decision: 'Pending',
        details: 'my details',
        state: 'awaitingReasonsForAppeal',
        type: 'Time extension',
        evidence: []
      }
    }];
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(redirectStub.calledWith(paths.common.forbidden)).to.equal(true);
  });

  it('should allow access to page if inFlight is not defined', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.askForMoreTime = {};
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should allow access to page if no time extension in progress', () => {
    req.session.appeal.appealStatus = 'awaitingReasonsForAppeal';
    req.session.appeal.askForMoreTime = { inFlight: false };
    isTimeExtensionsInProgress(req as Request, res as Response, next);
    expect(next.called).to.equal(true);
  });
});
