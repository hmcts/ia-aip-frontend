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
    getHowToHelpPage,
    getMoreHelpPage,
    getNotificationsSupportPage,
    getOfflineProcessesPage,
    getWhatIsService,
    setupGuidancePagesController
} from '../../../app/controllers/guidance-page';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { getGuidancePageText } from '../../../app/utils/guidance-page-utils';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Contact details Controller', () => {
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
    });
  });

  describe('getGuidancePages', () => {
    it('getCaseworkerPage should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('caseworker');

      getCaseworkerPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk',{
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('getHomeOfficeDocumentsPage should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('homeOfficeDocuments');

      getHomeOfficeDocumentsPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk',{
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('getMoreHelpPage should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('helpWithAppeal');

      getMoreHelpPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('getMoreHelpPage should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('evidenceToSupportAppeal');

      getEvidenceToSupportAppealPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });

    it('name should render guidance-pages/online-guidance-support/what-is-service.njk', () => {
      getWhatIsService(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/what-is-service.njk');
    });

    it('name should render guidance-pages/online-guidance-support/documents.njk', () => {
      getDocumentsPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/documents.njk');
    });

    it('name should render guidance-pages/online-guidance-support/four-stages-of-process.njk', () => {
      getFourStagesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/four-stages-of-process.njk');
    });

    it('name should render guidance-pages/online-guidance-support/notifications.njk', () => {
      getNotificationsSupportPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/notifications.njk');
    });

    it('name should render guidance-pages/online-guidance-support/how-to-give-feedback.njk', () => {
      getGiveFeedbackPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/how-to-give-feedback.njk');
    });

    it('name should render guidance-pages/online-guidance-support/how-to-help.njk', () => {
      getHowToHelpPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/how-to-help.njk');
    });

    it('name should render guidance-pages/online-guidance-support/offline-process.njk', () => {
      getOfflineProcessesPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/offline-process.njk');
    });

    it('name should render guidance-pages/online-guidance-support/guidance.njk', () => {
      getGuidanceSupportPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/guidance.njk');
    });

    it('name should render guidance-pages/online-guidance-support/getting-started.njk', () => {
      getGettingStartedPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/online-guidance-support/getting-started.njk');
    });

    it('name should render guidance-pages/online-guidance-support/place', () => {
      getEvidenceToSupportAppealPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk');
    });
  });
});
