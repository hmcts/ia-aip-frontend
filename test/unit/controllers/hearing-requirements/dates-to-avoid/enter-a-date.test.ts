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
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sandbox.useFakeTimers(new Date('2025-03-20'));
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          application: {},
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
    clock.restore();
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
      const expectedArgs = {
        date: null,
        availableHearingDates: { from: '20 March 2025', to: '01 May 2025' },
        formAction: '/hearing-dates-avoid-enter',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        saveAndContinueOnly: true,
        hasNonLegalRep: false
      };

      getEnterADatePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk', expectedArgs);
    });

    it('should render template with hasNonLegalRep', () => {
      req.session.appeal.application.hasNonLegalRep = 'Yes';
      const expectedArgs = {
        date: null,
        availableHearingDates: { from: '20 March 2025', to: '01 May 2025' },
        formAction: '/hearing-dates-avoid-enter',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        saveAndContinueOnly: true,
        hasNonLegalRep: true
      };

      getEnterADatePage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk', expectedArgs);
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
        saveAndContinueOnly: true,
        hasNonLegalRep: false
      };

      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(renderStub.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk', expectedArgs)).to.equal(true);
    });

    it('should render template with previously saved answer and hasNonLegalRep', () => {

      req.params.id = '0';
      req.session.appeal.application.hasNonLegalRep = 'Yes';
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
        saveAndContinueOnly: true,
        hasNonLegalRep: true
      };

      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(renderStub.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk', expectedArgs)).to.equal(true);
    });

    it('should do nothing template with no dates', () => {
      getEnterADatePageWithId(req as Request, res as Response, next);
      expect(renderStub.called).to.equal(false);
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
        saveAndContinueOnly: true,
        hasNonLegalRep: false

      };

      await postEnterADatePage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk',
        expectedArgs);
    });

    it('should fail validation and render template with errors and hasNonLegalRep', async () => {
      const invalidDate = moment().add(-1, 'week');
      req.session.appeal.application.hasNonLegalRep = 'Yes';
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
        saveAndContinueOnly: true,
        hasNonLegalRep: true

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

  describe('postEnterADatePageWithId', () => {
    it('should fail validation and render template with errors', async () => {
      req.params.id = '0';

      const invalidDate = moment(new Date('10-02-1989')).add(1, 'week');

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
        saveAndContinueOnly: true,
        hasNonLegalRep: false
      };

      await postEnterADatePageWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('hearing-requirements/dates-to-avoid/enter-a-date.njk',
        expectedArgs);
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
