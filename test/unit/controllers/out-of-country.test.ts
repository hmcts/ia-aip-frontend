import express, { NextFunction, Request, Response } from 'express';
import {
  getAppellantInUk,
  getGwfReference,
  getOocHrEea,
  getOocHrEuInside,
  getOocProtectionDepartureDate,
  postAppellantInUk, postGwfReference, postOocHrEea,
  postOocHrEuInside,
  postOocProtectionDepartureDate,
  setupOutOfCountryController
} from '../../../app/controllers/appeal-application/out-of-country';
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
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        } as Appeal
      } as Partial<Express.Session>,
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

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: sandbox.stub().returns({
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
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.appealOutOfCountry);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.appealOutOfCountry);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.oocHrEuInside);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.oocHrEuInside);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.gwfReference);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.gwfReference);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.oocHrEea);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.oocHrEea);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.oocProtectionDepartureDate);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.oocProtectionDepartureDate);
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
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/appeal-out-of-country.njk', {
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
      expect(next).to.have.been.calledOnce.calledWith(error);
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

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          appellantInUk: 'No'
        }
      } as Appeal);
    });

    it('should validate and redirect to the type of appeal page', async () => {
      req.body['answer'] = 'No';
      await postAppellantInUk(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', false);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.typeOfAppeal);
    });

    it('should fail validation and appeal-out-of-country.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'answer',
        text: 'Select yes if you are currently living in the United Kingdom',
        href: '#answer'
      };

      await postAppellantInUk(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/appeal-out-of-country.njk', {
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
      res.render = sandbox.stub().throws(error);
      await postAppellantInUk(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getOocHrEuInside', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render hr-eu-inside.njk', async () => {
      req.session.appeal.application.dateClientLeaveUk = {
        day: '1',
        month: '1',
        year: '2022'
      };
      getOocHrEuInside(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/hr-eu-inside.njk', {
        dateClientLeaveUk: req.session.appeal.application.dateClientLeaveUk,
        previousPage: paths.appealStarted.oocHrEea
      });
    });

    it('getOocHrEuInside should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getOocHrEuInside(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getGwfReference', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render gwf-reference.njk', async () => {
      // @ts-ignore
      req.session.appeal.application.gwfReferenceNumber = {
        gwfReferenceNumber: '123123123'
      };
      getGwfReference(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/gwf-reference.njk', {
        gwfReferenceNumber: req.session.appeal.application.gwfReferenceNumber,
        previousPage: paths.appealStarted.taskList
      });
    });

    it('getGwfReference should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getGwfReference(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postGwfReference', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.gwfReferenceNumber = '123123123';

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          appealType: 'euSettlementScheme',
          gwfReferenceNumber: req.body.gwfReferenceNumber
        }
      };

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          appealType: 'euSettlementScheme',
          gwfReferenceNumber: req.body.gwfReferenceNumber
        }
      } as Appeal);
    });

    it('should validate the gwf Reference Number', async () => {
      req.body['gwfReferenceNumber'] = '123123123';
      await postGwfReference(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/gwf-reference.njk', {
        errors: {
          gwfReferenceNumber: {
            key: 'gwfReferenceNumber',
            text: 'Enter the GWF reference number in the correct format',
            href: '#gwfReferenceNumber'
          }
        },
        errorList: [
          {
            key: 'gwfReferenceNumber',
            text: 'Enter the GWF reference number in the correct format',
            href: '#gwfReferenceNumber'
          }
        ],
        gwfReferenceNumber: '123123123',
        previousPage: paths.appealStarted.taskList
      });
    });

    it('should redirect to the check and send page', async () => {
      req.session.appeal.application.appealType = 'euSettlementScheme';
      await postGwfReference(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.letterReceived);
    });
  });

  describe('getOocHrEea', () => {
    afterEach(() => {
      sandbox.restore();
      LaunchDarklyService.close();
    });
    it('should render out-of-country/hr-eea.njk', async () => {
      req.session.appeal.appealOutOfCountry = 'No';
      await getOocHrEea(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/hr-eea.njk', {
        question: 'Were you outside the UK when you made your application?',
        description: undefined,
        modal: undefined,
        questionId: undefined,
        previousPage: paths.appealStarted.typeOfAppeal,
        answer: undefined,
        errors: undefined,
        errorList: undefined
      });
    });

    it('getOocHrEea should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getOocHrEea(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postOocHrEea', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body.outsideUkWhenApplicationMade = 'No';

      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          appealType: 'euSettlementScheme',
          outsideUkWhenApplicationMade: req.body.outsideUkWhenApplicationMade
        }
      };

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          appealType: 'euSettlementScheme',
          outsideUkWhenApplicationMade: req.body.outsideUkWhenApplicationMade
        }
      } as Appeal);
    });

    it('should fail validation and render hr-eu-inside.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'answer',
        text: 'Select yes if you are were living outside the United Kingdom when you made your application',
        href: '#answer'
      };

      await postOocHrEea(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/hr-eea.njk', {
        question: 'Were you outside the UK when you made your application?',
        description: undefined,
        modal: undefined,
        questionId: undefined,
        previousPage: paths.appealStarted.typeOfAppeal,
        answer: undefined,
        errors: { answer: expectedError },
        errorList: [expectedError]
      });
    });

    it('should redirect to the check and send page', async () => {
      req.body['answer'] = 'No';
      req.session.appeal.application.appealType = 'euSettlementScheme';
      await postOocHrEea(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.oocHrEuInside);
    });
  });

  describe('postOocHrEuInside', () => {
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

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
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
      await postOocHrEuInside(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should fail validation and render hr-eu-inside.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'day',
        text: 'Date must include a day, month and year',
        href: '#day'
      };

      await postOocHrEuInside(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/hr-eu-inside.njk', {
        error: { day: expectedError },
        errorList: [expectedError],
        dateClientLeaveUk: {
          ...req.body
        },
        previousPage: paths.appealStarted.oocHrEea
      });
    });

    it('postOocEu should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      req.body = { 'dateClientLeaveUk': undefined };
      res.render = sandbox.stub().throws(error);
      await postOocHrEuInside(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
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
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
        dateClientLeaveUk: req.session.appeal.application.dateClientLeaveUk,
        previousPage: paths.appealStarted.typeOfAppeal
      });
    });

    it('getOocProtectionDepartureDate should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getOocProtectionDepartureDate(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
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

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
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

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should fail validation and render ooc-protection-departure-date.njk with a validation error', async () => {
      req.body = { 'answer': undefined };
      const expectedError: ValidationError = {
        key: 'day',
        text: 'Date must include a day, month and year',
        href: '#day'
      };

      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/out-of-country/ooc-protection-departure-date.njk', {
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
      res.render = sandbox.stub().throws(error);
      await postOocProtectionDepartureDate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
