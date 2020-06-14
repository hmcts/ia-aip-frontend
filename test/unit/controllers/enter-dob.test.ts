const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getDateOfBirthPage,
  postDateOfBirth,
  setupPersonalDetailsController
} from '../../../app/controllers/appeal-application/personal-details';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

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
      cookies: {
        '__auth-token': 'atoken'
      },
      session: {
        appeal: {
          application: {
            personalDetails: {}
          }
        }
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
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
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: sandbox.stub()
    } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDateOfBirthController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];

      setupPersonalDetailsController(middleware, { updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.dob, middleware);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.dob, middleware);
    });
  });

  describe('getDateOfBirthPage', () => {
    it('should render appeal-application/personal-details/date-of-birth.njk', () => {
      getDateOfBirthPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/date-of-birth.njk');
    });

    it('when called with edit param should render appeal-application/personal-details/date-of-birth.njk and update session', () => {
      req.query = { 'edit': '' };

      getDateOfBirthPage(req as Request, res as Response, next);

      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/date-of-birth.njk');
    });
  });

  describe('postDateOfBirth @only', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.day = 1;
      req.body.month = 11;
      req.body.year = 1993;

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            dob: {
              day: req.body.day,
              month: req.body.month,
              year: req.body.year
            }
          }
        }
      };
      updateAppealService.mapCcdCaseToAppeal = sandbox.stub().returns({
        application: {
          personalDetails: {
            dob: {
              day: req.body.day,
              month: req.body.month,
              year: req.body.year
            }
          }
        }
      } as Appeal);
    });
    it('should validate and redirect to next page personal-details/nationality', async () => {
      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.nationality);
    });

    it('when in edit mode should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };

      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };

      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });
  });

  describe('Should catch an error.', function () {
    function createError(fieldName, errorMessage) {
      return {
        href: `#${fieldName}`,
        key: fieldName,
        text: errorMessage
      };
    }

    it('getDateOfBirthPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getDateOfBirthPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should early fail validation and render appeal-application/personal-details/date-of-birth.njk with error', async () => {
      const errorDay = createError('day', i18n.validationErrors.dateOfBirth.incorrectFormat);
      req.body.day = 0;

      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/date-of-birth.njk',
        {
          dob: { day: 0 },
          errors: {
            day: errorDay
          },
          errorList: [ errorDay ],
          previousPage: paths.appealStarted.name
        }
      );
    });

    it('should early fail validation and render appeal-application/personal-details/date-of-birth.njk with error', async () => {
      req.body.day = 1;
      req.body.month = 0;
      const errorMonth = createError('month', i18n.validationErrors.dateOfBirth.incorrectFormat);
      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/date-of-birth.njk',
        {
          dob: { ...req.body },
          errors: {
            month: errorMonth
          },
          errorList: [ errorMonth ],
          previousPage: paths.appealStarted.name
        }
      );
    });

    it('should early fail validation and render appeal-application/personal-details/date-of-birth.njk with error', async () => {
      req.body.day = 1;
      req.body.month = 1;
      req.body.year = 0;
      const errorYear = createError('year', i18n.validationErrors.dateOfBirth.incorrectFormat);
      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/date-of-birth.njk',
        {
          dob: { ...req.body },
          errors: {
            year: errorYear
          },
          errorList: [ errorYear ],
          previousPage: paths.appealStarted.name
        }
      );
    });

    it('should early fail validation and render appeal-application/personal-details/date-of-birth.njk with error', async () => {
      req.body.day = 1;
      req.body.month = 1;
      req.body.year = 9999;
      const errorDate = createError('date', i18n.validationErrors.dateOfBirth.inPast);
      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/date-of-birth.njk',
        {
          dob: { ...req.body },
          errors: {
            date: errorDate
          },
          errorList: [ errorDate ],
          previousPage: paths.appealStarted.name
        }
      );
    });
  });
})
;
