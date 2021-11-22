import express, { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getEnterADatePage,
  getEnterADatePageWithId,
  postEnterADatePage,
  postEnterADatePageWithId,
  setupHearingDatesToAvoidEnterADateController
} from '../../../../../app/controllers/hearing-requirements/dates-to-avoid/enter-a-date';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { dayMonthYearFormat } from '../../../../../app/utils/date-utils';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Enter A date controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          hearingRequirements: {
            datesToAvoid: {
              isDateCannotAttend: true
            }
          }
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDatesToAvoidEnterADateController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingDatesToAvoidEnterADateController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate);
    });
  });

  describe('getEnterADatePage', () => {
    it('should render template', () => {
      getEnterADatePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk');
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getEnterADatePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getEnterADatePageWithId', () => {
    it('should render template with previously saved answer', () => {

      req.params.id = '0';

      req.session.appeal.hearingRequirements.datesToAvoid.dates = [ {
        date: {
          day: '20',
          month: '6',
          year: '2020'
        }
      } ];

      const availableDates = {
        from: moment().add(2, 'week').format(dayMonthYearFormat),
        to: moment().add(12, 'week').format(dayMonthYearFormat)
      };

      const expectedArgs = {
        availableDates: { from: availableDates.from, to: availableDates.to },
        date: { day: '20', month: '6', year: '2020' },
        formAction: '/hearing-dates-avoid-enter/0',
        previousPage: {
          attributes: { onclick: 'history.go(-1); return false;' }
        }

      };

      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      req.params.id = '0';
      req.session.appeal.hearingRequirements.datesToAvoid.dates = [ {
        date: {
          day: '20',
          month: '6',
          year: '2020'
        }
      } ];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postEnterADatePage', () => {
    it('should fail validation and render template with errors', async () => {
      const invalidDate = moment().add(1, 'week');

      req.body['day'] = invalidDate.date();
      req.body['month'] = invalidDate.month();
      req.body['year'] = invalidDate.year();

      const availableDates = {
        from: moment().add(2, 'week').format(dayMonthYearFormat),
        to: moment().add(12, 'week').format(dayMonthYearFormat)
      };

      const expectedValidationError = {
        date: {
          href: '#date',
          key: 'date',
          text: `Enter a date between ${availableDates.from} and ${availableDates.to}`
        }
      };

      const expectedArgs = {
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        date: { ...req.body },
        availableDates,
        formAction: '/hearing-dates-avoid-enter',
        previousPage: {
          attributes: { onclick: 'history.go(-1); return false;' }
        }
      };

      await postEnterADatePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk',
        expectedArgs);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postEnterADatePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

  });

  describe.skip('postEnterADatePageWithId', () => {
    it('should fail validation and render template with errors', async () => {
      req.params.id = '0';

      const invalidDate = moment().add(1, 'week');

      req.body['day'] = invalidDate.date();
      req.body['month'] = invalidDate.month();
      req.body['year'] = invalidDate.year();

      const availableDates = {
        from: moment().add(2, 'week').format(dayMonthYearFormat),
        to: moment().add(12, 'week').format(dayMonthYearFormat)
      };

      const expectedValidationError = {
        date: {
          href: '#date',
          key: 'date',
          text: `Enter a date between ${availableDates.from} and ${availableDates.to}`
        }
      };

      const expectedArgs = {
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        date: { ...req.body },
        availableDates,
        formAction: '/hearing-dates-avoid-enter/0',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } }
      };

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk',
        expectedArgs);
    });

    it('should validate and redirect to reason page with param id ', async () => {
      req.params.id = '0';

      const validDate = moment().add(5, 'week');

      req.body['day'] = validDate.date();
      req.body['month'] = validDate.month() + 2;
      req.body['year'] = validDate.year();

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith('/hearing-dates-avoid-reasons/0');
    });

    it('should catch error and call next with error', async () => {
      req.params.id = '0';

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
