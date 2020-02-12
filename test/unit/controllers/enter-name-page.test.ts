import { NextFunction, Request, Response } from 'express';
import { getNamePage, postNamePage, setupPersonalDetailsController } from '../../../app/controllers/appeal-application/personal-details';
import { paths } from '../../../app/paths';
import { Events } from '../../../app/service/ccd-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Personal Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {},
      session: {
        appeal: {
          application: {}
        }
      },
      idam: {
        userDetails: {
          forename: 'forename',
          surname: 'surname'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as unknown as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupPersonalDetailsController({ updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.name);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.name);
    });
  });

  describe('getNamesPage', () => {
    it('should render personal-details/name.njk', function () {
      getNamePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/name.njk');
    });

    it('when called with edit should render personal-details/name.njk and update session', function () {
      req.query = { 'edit': '' };
      getNamePage(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/name.njk');
    });

    it('gets name from session', function () {
      req.session.appeal.application.personalDetails = { givenNames: 'givenName', familyName: 'familyName', dob: null };
      getNamePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/name.njk',
        {
          personalDetails: {
            dob: null,
            familyName: 'familyName',
            givenNames: 'givenName'
          },
          previousPage: paths.taskList
        }
      );
    });
  });

  describe('postNamePage', () => {
    it('should validate and redirect to next page personal-details/date-of-birth', async () => {
      req.body.givenNames = 'Lewis';
      req.body.familyName = 'Williams';

      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledWith(paths.personalDetails.dob);
    });

    it('when in edit mode should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body.givenNames = 'Lewis';
      req.body.familyName = 'Williams';

      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.overview);
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
    });
  });

  describe('Should catch an error.', () => {
    it('getPageName should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNamePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render personal-details/name.njk with error', async () => {
      req.body.givenNames = '';
      req.body.familyName = '';
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const familyNameError: ValidationError = {
        href: '#familyName',
        key: 'familyName',
        text: 'Enter your family name or names'
      };
      const givenNameErrors: ValidationError = {
        href: '#givenNames',
        key: 'givenNames',
        text: 'Enter your given name or names'
      };

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/name.njk',
        {
          error: {
            givenNames: givenNameErrors,
            familyName: familyNameError
          },
          errorList: [ givenNameErrors, familyNameError ],
          personalDetails: { familyName: '', givenNames: '' },
          previousPage: paths.taskList
        });
    });
  });
});
