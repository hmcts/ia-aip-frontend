import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { getAppellantInUk, getOocHrInside, getOocProtectionDepartureDate, postAppellantInUk, postOocHrInside, postOocProtectionDepartureDate, setupOutOfCountryController } from '../../../app/controllers/appeal-application/out-of-country';
import { getTypeOfAppeal } from '../../../app/controllers/appeal-application/type-of-appeal';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Out of Country Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.useFakeTimers(new Date('2025-06-15'));
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        } as Appeal
      } as Partial<session.Session>,
      cookies: {
        '__auth-token': 'atoken'
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
    } as Partial<Request>;
    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: submitRefactoredStub.returns({
        case_data: {
          homeOfficeReferenceNumber: 'A1234567'
        }
      })
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupOutOfCountryController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupOutOfCountryController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.appealStarted.appealOutOfCountry)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.appealOutOfCountry)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.oocHrInside)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.oocHrInside)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.gwfReference)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.gwfReference)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.oocHrEea)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.oocHrEea)).to.equal(true);
      expect(routerGetStub.calledWith(paths.appealStarted.oocProtectionDepartureDate)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.oocProtectionDepartureDate)).to.equal(true);
    });
  });

  describe('getAppellantInUk', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render appeal-out-of-country.njk with payments feature flag OFF', async () => {
      req.session.appeal.appealOutOfCountry = 'No';
      await getAppellantInUk(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/appeal-out-of-country.njk', {
        question: 'Are you currently living in the United Kingdom?',
        description: undefined,
        modal: undefined,
        questionId: undefined,
        previousPage: paths.appealStarted.taskList,
        answer: undefined,
        errors: undefined,
        errorList: undefined
      });
    });

    it('getTypeOfAppeal should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getTypeOfAppeal(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postAppellantInUk', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          appellantInUk: 'No'
        }
      };

      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          appellantInUk: 'No'
        }
      } as Appeal);
    });

    it('should validate and redirect to the type of appeal page', async () => {
      req.body['answer'] = 'No';
      await postAppellantInUk(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false)).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.typeOfAppeal)).to.equal(true);
    });

    it('should fail validation and appeal-out-of-country.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'answer',
        text: 'Select yes if you are currently living in the United Kingdom',
        href: '#answer'
      };

      await postAppellantInUk(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/appeal-out-of-country.njk', {
        question: 'Are you currently living in the United Kingdom?',
        description: undefined,
        modal: undefined,
        questionId: undefined,
        previousPage: paths.appealStarted.typeOfAppeal,
        answer: undefined,
        errors: { answer: expectedError },
        errorList: [expectedError]
      });
    });

    it('postAppellantInUk should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'appealOutOfCountry': undefined };
      res.render = renderStub.throws(error);
      await postAppellantInUk(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getOocHrInside', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render hr-inside.njk', async () => {
      req.session.appeal.application.dateClientLeaveUk = {
        day: '1',
        month: '1',
        year: '2022'
      };
      getOocHrInside(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/hr-inside.njk', {
        dateClientLeaveUk: req.session.appeal.application.dateClientLeaveUk,
        previousPage: paths.appealStarted.oocHrEea
      });
    });

    it('getOocHrInside should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getOocHrInside(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postOocHrInside', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.day = 1;
      req.body.month = 11;
      req.body.year = 1993;

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          dateClientLeaveUk: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      };

      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          isAppealLate: false,
          dateClientLeaveUk: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      } as Appeal);
    });

    it('should validate and redirect to the type of appeal page', async () => {
      req.body['day'] = 1;
      req.body['month'] = 11;
      req.body['year'] = 1993;
      await postOocHrInside(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should fail validation and render hr-inside.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'day',
        text: 'Date must include a day, month and year',
        href: '#day'
      };

      await postOocHrInside(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/hr-inside.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        dateClientLeaveUk: {
          ...req.body
        },
        previousPage: paths.appealStarted.oocHrEea
      });
    });

    it('postOocHrInside should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'dateClientLeaveUk': undefined };
      res.render = renderStub.throws(error);
      await postOocHrInside(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getOocProtectionDepartureDate', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render ooc-protection-departure-date.njk', async () => {
      req.session.appeal.application.dateClientLeaveUk = {
        day: '1',
        month: '1',
        year: '2022'
      };
      getOocProtectionDepartureDate(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
        dateClientLeaveUk: req.session.appeal.application.dateClientLeaveUk,
        previousPage: paths.appealStarted.typeOfAppeal
      });
    });

    it('getOocProtectionDepartureDate should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);
      getOocProtectionDepartureDate(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postOocProtectionDepartureDate', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.day = 1;
      req.body.month = 11;
      req.body.year = 1993;

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          dateClientLeaveUk: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      };

      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          isAppealLate: false,
          dateClientLeaveUk: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          }
        }
      } as Appeal);
    });

    it('should validate and redirect to the type of appeal page', async () => {
      req.body['day'] = 1;
      req.body['month'] = 11;
      req.body['year'] = 1993;
      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should fail validation and render ooc-protection-departure-date.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'day',
        text: 'Date must include a day, month and year',
        href: '#day'
      };

      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        dateClientLeaveUk: {
          ...req.body
        },
        previousPage: paths.appealStarted.typeOfAppeal
      });
    });

    it('should fail validation and render ooc-protection-departure-date.njk with a validation error with month in future', async () => {
      const currentDate = new Date();
      const futureMonth = (currentDate.getMonth() + 1) < 12 ? (currentDate.getMonth() + 2) : 1;
      const futureYear = (currentDate.getMonth() + 1) < 12 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;

      req.body['day'] = 1;
      req.body['month'] = futureMonth;
      req.body['year'] = futureYear;

      const futureMonthError: ValidationError = {
        key: 'month',
        text: 'The date must be in the past',
        href: '#month'
      };

      const futureYearError: ValidationError = {
        key: 'year',
        text: 'The date must be in the past',
        href: '#year'
      };

      const expectedError = (futureMonth === 1 && futureYear === currentDate.getFullYear() + 1)
        ? futureYearError
        : futureMonthError;

      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
        error: { [expectedError.key]: expectedError },
        errorList: [expectedError],
        dateClientLeaveUk: {
          ...req.body
        },
        previousPage: paths.appealStarted.typeOfAppeal
      });
    });

    it('should fail validation and render ooc-protection-departure-date.njk with a validation error with day in future', async () => {
      const currentDate = new Date();

      const tomorrowDate = new Date();
      tomorrowDate.setDate(currentDate.getDate() + 1);

      req.body['day'] = tomorrowDate.getDate();
      req.body['month'] = tomorrowDate.getMonth() + 1;
      req.body['year'] = tomorrowDate.getFullYear();

      const expectedError: ValidationError = {
        key: 'day',
        text: 'The date must be in the past',
        href: '#day'
      };

      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        dateClientLeaveUk: {
          ...req.body
        },
        previousPage: paths.appealStarted.typeOfAppeal
      });
    });

    it('should fail validation and render ooc-protection-departure-date.njk with a validation error with invalid date', async () => {
      const currentDate = new Date();

      const tomorrowDate = new Date();
      tomorrowDate.setDate(currentDate.getDate() + 1);

      req.body['day'] = 31;
      req.body['month'] = 4;
      req.body['year'] = 2024;

      const expectedError: ValidationError = {
        key: 'day',
        text: 'Enter the date in the correct format',
        href: '#day'
      };

      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        dateClientLeaveUk: {
          ...req.body
        },
        previousPage: paths.appealStarted.typeOfAppeal
      });
    });

    it('postOocProtectionDepartureDate should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'dateClientLeaveUk': undefined };
      res.render = renderStub.throws(error);
      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
