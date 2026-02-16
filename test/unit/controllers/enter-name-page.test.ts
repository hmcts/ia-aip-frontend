import { NextFunction, Request, Response } from 'express';
import { getNamePage, postNamePage, setupHomeOfficeDetailsController } from '../../../app/controllers/appeal-application/home-office-details';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Home Office Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  let submitRefactoredStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      session: {
        appeal: {
          application: {}
        }
      },
      idam: {
        userDetails: {
          forename: 'forename',
          surname: 'surname',
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as unknown as Partial<Request>;

    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();
    submitRefactoredStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = {
      submitEventRefactored: submitRefactoredStub,
      submitEvent: submitStub
    } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHomeOfficeDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];

      setupHomeOfficeDetailsController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.appealStarted.name, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.name, middleware)).to.equal(true);
    });
  });

  describe('getNamesPage', () => {
    it('should render personal-details/name.njk', function () {
      getNamePage(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/personal-details/name.njk')).to.equal(true);
    });

    it('when called with edit should render personal-details/name.njk and update session', function () {
      req.query = { 'edit': '' };
      getNamePage(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(renderStub.calledOnceWith('appeal-application/personal-details/name.njk')).to.equal(true);
    });

    it('gets name from session', function () {
      req.session.appeal.application.personalDetails = { givenNames: 'givenName', familyName: 'familyName', dob: null };
      getNamePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/name.njk',
        {
          personalDetails: {
            dob: null,
            familyName: 'familyName',
            givenNames: 'givenName'
          },
          previousPage: paths.appealStarted.details
        }
      );
    });

    it('gets name from session with gwf reference previous page', function () {
      req.session.appeal.application.personalDetails = { givenNames: 'givenName', familyName: 'familyName', dob: null };
      req.session.appeal.application.outsideUkWhenApplicationMade = 'Yes';
      getNamePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/name.njk',
        {
          personalDetails: {
            dob: null,
            familyName: 'familyName',
            givenNames: 'givenName'
          },
          previousPage: paths.appealStarted.gwfReference
        }
      );
    });
  });

  describe('postNamePage', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.givenNames = 'Lewis';
      req.body.familyName = 'Williams';

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            familyName: req.body.familyName,
            givenNames: req.body.givenNames
          }
        }
      };
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          personalDetails: {
            familyName: req.body.familyName,
            givenNames: req.body.givenNames
          }
        }
      } as Appeal);
    });
    it('should validate and redirect to next page personal-details/date-of-birth', async () => {
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.dob)).to.equal(true);
    });

    it('when in edit mode should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body = {
        saveForLater: 'saveForLater'
      };
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should redirect to CYA page and validate when save for later clicked', async () => {
      req.body.saveForLater = 'saveForLater';
      await postNamePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });
  });

  describe('Should catch an error.', () => {
    it('getPageName should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getNamePage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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

      expect(submitStub.called).to.equal(false);
      expect(renderStub).to.be.calledWith(
        'appeal-application/personal-details/name.njk',
        {
          error: {
            givenNames: givenNameErrors,
            familyName: familyNameError
          },
          errorList: [ givenNameErrors, familyNameError ],
          personalDetails: { familyName: '', givenNames: '' },
          previousPage: paths.appealStarted.details
        });
    });

    it('should fail validation and render personal-details/name.njk with error with gwf reference previous page', async () => {
      req.body.givenNames = '';
      req.body.familyName = '';
      req.session.appeal.application.outsideUkWhenApplicationMade = 'Yes';
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

      expect(submitStub.called).to.equal(false);
      expect(renderStub).to.be.calledWith(
        'appeal-application/personal-details/name.njk',
        {
          error: {
            givenNames: givenNameErrors,
            familyName: familyNameError
          },
          errorList: [ givenNameErrors, familyNameError ],
          personalDetails: { familyName: '', givenNames: '' },
          previousPage: paths.appealStarted.gwfReference
        });
    });
  });
});
