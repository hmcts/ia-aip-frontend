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
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;

  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          directions: [],
          hearingRequirements: {
            datesToAvoid: {
              isDateCannotAttend: true
            }
          }
        }
      }
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

  describe('setupDatesToAvoidEnterADateController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingDatesToAvoidEnterADateController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate)).to.equal(true);
    });
  });

  describe('getEnterADatePage', () => {
    it('should render template', () => {
      getEnterADatePage(req as Request, res as Response, next);
      expect(renderStub.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk')).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getEnterADatePage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getEnterADatePageWithId', () => {
    it('should render template with previously saved answer', () => {

      req.params.id = '0';

      req.session.appeal.hearingRequirements.datesToAvoid.dates = [{
        date: {
          day: '20',
          month: '6',
          year: '2020'
        }
      }];

      const availableHearingDates = {
        from: moment().add(0, 'week').format(dayMonthYearFormat),
        to: moment().add(6, 'week').format(dayMonthYearFormat)
      };

      const expectedArgs = {
        date: { day: '20', month: '6', year: '2020' },
        availableHearingDates: { from: availableHearingDates.from, to: availableHearingDates.to },
        formAction: '/hearing-dates-avoid-enter/0',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        saveAndContinueOnly: true

      };

      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(renderStub.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk', expectedArgs)).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      req.params.id = '0';
      req.session.appeal.hearingRequirements.datesToAvoid.dates = [{
        date: {
          day: '20',
          month: '6',
          year: '2020'
        }
      }];
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postEnterADatePage', () => {
    it('should fail validation and render template with errors', async () => {
      const invalidDate = moment().add(-1, 'week');

      req.body['day'] = invalidDate.date();
      req.body['month'] = invalidDate.month() + 1;
      req.body['year'] = invalidDate.year();

      const availableHearingDates = {
        from: moment().add(0, 'week').format(dayMonthYearFormat),
        to: moment().add(6, 'week').format(dayMonthYearFormat)
      };

      const expectedValidationError = {
        date: {
          key: 'date',
          text: `Enter a date between ${availableHearingDates.from} and ${availableHearingDates.to}`,
          href: '#date'
        }
      };

      const expectedArgs = {
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        date: { ...req.body },
        availableHearingDates,
        formAction: '/hearing-dates-avoid-enter',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        saveAndContinueOnly: true
      };

      await postEnterADatePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk',
        expectedArgs);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postEnterADatePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

  });

  describe.skip('postEnterADatePageWithId', () => {
    it('should fail validation and render template with errors', async () => {
      req.params.id = '0';

      const invalidDate = moment().add(1, 'week');

      req.body['day'] = invalidDate.date();
      req.body['month'] = invalidDate.month();
      req.body['year'] = invalidDate.year();

      const availableHearingDates = {
        from: moment().add(0, 'week').format(dayMonthYearFormat),
        to: moment().add(6, 'week').format(dayMonthYearFormat)
      };

      const expectedValidationError = {
        date: {
          href: '#date',
          key: 'date',
          text: `Enter a date between ${availableHearingDates.from} and ${availableHearingDates.to}`
        }
      };

      const expectedArgs = {
        errors: expectedValidationError,
        errorList: Object.values(expectedValidationError),
        date: { ...req.body },
        availableHearingDates,
        formAction: '/hearing-dates-avoid-enter/0',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        saveAndContinueOnly: true
      };

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk',
        expectedArgs);
    });

    it('should validate and redirect to reason page with param id ', async () => {
      req.params.id = '0';

      const validDate = moment().add(5, 'week');

      req.body['day'] = validDate.date();
      req.body['month'] = validDate.month() + 2;
      req.body['year'] = validDate.year();

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith('/hearing-dates-avoid-reasons/0')).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      req.params.id = '0';

      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
