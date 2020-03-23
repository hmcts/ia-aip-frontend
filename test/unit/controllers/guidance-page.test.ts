import { NextFunction, Request, Response } from 'express';
import {
    getCaseworkerPage,
    getEvidenceToSupportAppealPage,
    getHomeOfficeDocumentsPage,
    getMoreHelpPage,
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
      expect(routerGetStub).to.have.been.calledWith(paths.guidancePages.homeOfficeDocuments);
      expect(routerGetStub).to.have.been.calledWith(paths.guidancePages.evidenceToSupportAppeal);
      expect(routerGetStub).to.have.been.calledWith(paths.guidancePages.moreHelp);
      expect(routerGetStub).to.have.been.calledWith(paths.guidancePages.tribunalCaseworker);
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

    it('getEvidenceToSupportAppealPage should render guidance-pages/guidance-page.njk', () => {
      const text = getGuidancePageText('evidenceToSupportAppeal');

      getEvidenceToSupportAppealPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('guidance-pages/guidance-page.njk', {
        showContactUs: true,
        previousPage:  { attributes: { onclick: 'history.go(-1); return false;' } },
        page: text
      });
    });
  });
});
