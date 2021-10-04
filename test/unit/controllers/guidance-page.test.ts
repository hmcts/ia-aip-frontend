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
  let next: NextFunction;
  const logger: Logger = new Logger();

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

    updateAppealService = { submitEvent: sandbox.stub() };

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupContactDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupGuidancePagesController();
      expect(routerGetStub).to.have.been.calledWith(paths.common.homeOfficeDocuments);
      expect(routerGetStub).to.have.been.calledWith(paths.common.evidenceToSupportAppeal);
      expect(routerGetStub).to.have.been.calledWith(paths.common.moreHelp);
      expect(routerGetStub).to.have.been.calledWith(paths.common.tribunalCaseworker);
      expect(routerGetStub).to.have.been.calledWith(paths.common.whatIsIt);
      expect(routerGetStub).to.have.been.calledWith(paths.common.documents);
      expect(routerGetStub).to.have.been.calledWith(paths.common.fourStages);
      expect(routerGetStub).to.have.been.calledWith(paths.common.notifications);
      expect(routerGetStub).to.have.been.calledWith(paths.common.giveFeedback);
      expect(routerGetStub).to.have.been.calledWith(paths.common.howToHelp);
      expect(routerGetStub).to.have.been.calledWith(paths.common.offlineProcesses);
      expect(routerGetStub).to.have.been.calledWith(paths.common.guidance);
      expect(routerGetStub).to.have.been.calledWith(paths.common.gettingStarted);
      expect(routerGetStub).to.have.been.calledWith(paths.common.whatToExpectAtHearing);
      expect(routerGetStub).to.have.been.calledWith(paths.common.homeOfficeWithdrawDecision);
      expect(routerGetStub).to.have.been.calledWith(paths.common.homeOfficeWithdrawDecision);
    });
  });

  it('whatToExpectAtHearing should render guidance-pages/guidance-page.njk', () => {
    const text = getGuidancePageText('whatToExpectAtHearing');

    getWhatToExpectAtHearing(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
      page: text
    });
  });

  describe('getCaseworkerPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('caseworker');

      getCaseworkerPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk',{
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getCaseworkerPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });

  });

  describe('getHomeOfficeDocumentsPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('homeOfficeDocuments');

      getHomeOfficeDocumentsPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk',{
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHomeOfficeDocumentsPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getMoreHelpPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('helpWithAppeal');

      getMoreHelpPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getMoreHelpPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getEvidenceToSupportAppealPage', () => {
    it('should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('evidenceToSupportAppeal');

      getEvidenceToSupportAppealPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getEvidenceToSupportAppealPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHomeOfficeWithdrawDecision', () => {
    it('should render guidance-pages/guidance-page.njk', () => {

      getHomeOfficeWithdrawDecision(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        hearingCentreEmail: getHearingCentreEmail(req as Request),
        page: i18n.pages.guidancePages.withdrawDecision
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHomeOfficeWithdrawDecision(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHomeOfficeMaintainDecision', () => {
    it('should render guidance-pages/guidance-page.njk', () => {

      getHomeOfficeMaintainDecision(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: i18n.pages.guidancePages.maintainDecision
      });
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHomeOfficeMaintainDecision(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getWhatIsService', () => {
    it('should render guidance-pages/online-guidance-support/what-is-service.njk', () => {
      getWhatIsService(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/what-is-service.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getWhatIsService(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDocumentsPage', () => {
    it('should render guidance-pages/online-guidance-support/documents.njk', () => {
      getDocumentsPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/documents.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getDocumentsPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getFourStagesPage', () => {
    it('should render guidance-pages/online-guidance-support/four-stages-of-process.njk', () => {
      getFourStagesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/four-stages-of-process.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getFourStagesPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getNotificationsSupportPage', () => {
    it('should render guidance-pages/online-guidance-support/notifications.njk', () => {
      getNotificationsSupportPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/notifications.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getNotificationsSupportPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getGiveFeedbackPage', () => {
    it('should render guidance-pages/online-guidance-support/how-to-give-feedback.njk', () => {
      getGiveFeedbackPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/how-to-give-feedback.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getGiveFeedbackPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHowToHelpPage', () => {
    it('should render guidance-pages/online-guidance-support/how-to-help.njk', () => {
      getHowToHelpPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/how-to-help.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHowToHelpPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getOfflineProcessesPage', () => {
    it('should render guidance-pages/online-guidance-support/offline-process.njk', () => {
      getOfflineProcessesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/offline-process.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getOfflineProcessesPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getGuidanceSupportPage', () => {
    it('should render guidance-pages/online-guidance-support/guidance.njk', () => {
      getGuidanceSupportPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/guidance.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getGuidanceSupportPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getGettingStartedPage', () => {
    it('should render guidance-pages/online-guidance-support/getting-started.njk', () => {
      getGettingStartedPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/getting-started.njk');
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getGettingStartedPage(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
