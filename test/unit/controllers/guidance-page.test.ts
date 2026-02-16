import { NextFunction, Request, Response } from 'express';
import {
  getCaseworkerPage,
  getDocumentsPage,
  getEvidenceToSupportAppealPage,
  getFourStagesPage,
  getGettingStartedPage,
  getGiveFeedbackPage,
  getGuidanceSupportPage,
  getHomeOfficeDocumentsPage,
  getHomeOfficeMaintainDecision,
  getHomeOfficeWithdrawDecision,
  getHowToHelpPage,
  getMoreHelpPage,
  getNotificationsSupportPage,
  getOfflineProcessesPage,
  getUnderstandingHearingBundle,
  getWhatIsService,
  getWhatToExpectAtHearing,
  setupGuidancePagesController
} from '../../../app/controllers/guidance-page';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { getHearingCentreEmail } from '../../../app/utils/cma-hearing-details';
import { getGuidancePageText } from '../../../app/utils/guidance-page-utils';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Guidance page controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          hearing: {
            hearingCentre: 'taylorHouse'
          },
          application: {
            contactDetails: {}
          }
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
      } as any,
      body: {}
    } as Partial<Request>;

    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = { submitEvent: submitStub } as Partial<UpdateAppealService>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupContactDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupGuidancePagesController();
      expect(routerGetStub.calledWith(paths.common.homeOfficeDocuments)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.evidenceToSupportAppeal)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.moreHelp)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.tribunalCaseworker)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.whatIsIt)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.documents)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.fourStages)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.notifications)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.giveFeedback)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.howToHelp)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.offlineProcesses)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.guidance)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.gettingStarted)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.whatToExpectAtHearing)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.understandingHearingBundle)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.homeOfficeWithdrawDecision)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.homeOfficeWithdrawDecision)).to.equal(true);
    });
  });

  it('whatToExpectAtHearing should render guidance-pages/guidance-page.njk', () => {
    const text = getGuidancePageText('whatToExpectAtHearing');

    getWhatToExpectAtHearing(req as Request, res as Response, next);
    expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
      page: text
    });

    it('understandingHearingBundle should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('understandingHearingBundle');

      getUnderstandingHearingBundle(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });
  });

  it('understandingHearingBundle should render guidance-pages/guidance-page.njk', () => {
    const text = getGuidancePageText('understandingHearingBundle');

    getUnderstandingHearingBundle(req as Request, res as Response, next);
    expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
      page: text
    });

    it('understandingHearingBundle should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('understandingHearingBundle');

      getUnderstandingHearingBundle(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });
  });

  describe('getCaseworkerPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('caseworker');

      getCaseworkerPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getCaseworkerPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });

  });

  describe('getHomeOfficeDocumentsPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('homeOfficeDocuments');

      getHomeOfficeDocumentsPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getHomeOfficeDocumentsPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getMoreHelpPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('helpWithAppeal');

      getMoreHelpPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getMoreHelpPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getEvidenceToSupportAppealPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('evidenceToSupportAppeal');

      getEvidenceToSupportAppealPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getEvidenceToSupportAppealPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getHomeOfficeWithdrawDecision', () => {
    it('should render guidance-pages/guidance-page.njk', () => {

      getHomeOfficeWithdrawDecision(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        hearingCentreEmail: getHearingCentreEmail(req as Request),
        page: i18n.pages.guidancePages.withdrawDecision
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getHomeOfficeWithdrawDecision(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getHomeOfficeMaintainDecision', () => {
    it('should render guidance-pages/guidance-page.njk', () => {

      getHomeOfficeMaintainDecision(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        page: i18n.pages.guidancePages.maintainDecision
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getHomeOfficeMaintainDecision(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getWhatIsService', () => {
    it('should render guidance-pages/online-guidance-support/what-is-service.njk', () => {
      getWhatIsService(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/what-is-service.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getWhatIsService(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getDocumentsPage', () => {
    it('should render guidance-pages/online-guidance-support/documents.njk', () => {
      getDocumentsPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/documents.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getDocumentsPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getFourStagesPage', () => {
    it('should render guidance-pages/online-guidance-support/four-stages-of-process.njk', () => {
      getFourStagesPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/four-stages-of-process.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getFourStagesPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getNotificationsSupportPage', () => {
    it('should render guidance-pages/online-guidance-support/notifications.njk', () => {
      getNotificationsSupportPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/notifications.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getNotificationsSupportPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getGiveFeedbackPage', () => {
    it('should render guidance-pages/online-guidance-support/how-to-give-feedback.njk', () => {
      getGiveFeedbackPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/how-to-give-feedback.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getGiveFeedbackPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getHowToHelpPage', () => {
    it('should render guidance-pages/online-guidance-support/how-to-help.njk', () => {
      getHowToHelpPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/how-to-help.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getHowToHelpPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getOfflineProcessesPage', () => {
    it('should render guidance-pages/online-guidance-support/offline-process.njk', () => {
      getOfflineProcessesPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/offline-process.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getOfflineProcessesPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getGuidanceSupportPage', () => {
    it('should render guidance-pages/online-guidance-support/guidance.njk', () => {
      getGuidanceSupportPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/guidance.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getGuidanceSupportPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getGettingStartedPage', () => {
    it('should render guidance-pages/online-guidance-support/getting-started.njk', () => {
      getGettingStartedPage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('guidance-pages/online-guidance-support/getting-started.njk')).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getGettingStartedPage(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
