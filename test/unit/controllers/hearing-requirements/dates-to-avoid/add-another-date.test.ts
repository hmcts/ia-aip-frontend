import express, { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getAddAnotherDateQuestionPage, postAddAnotherDateQuestionPage,
  setupHearingDatesToAvoidAddAnotherDateController
} from '../../../../../app/controllers/hearing-requirements/dates-to-avoid/add-another-date';
import { paths } from '../../../../../app/paths';
import { dayMonthYearFormat } from '../../../../../app/utils/date-utils';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Add Another Date Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          directions: [],
          hearingRequirements: {}
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDatesToAvoidAddAnotherDateController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingDatesToAvoidAddAnotherDateController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingDateToAvoidNew);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.hearingDateToAvoidNew);
    });
  });

  describe('getAddAnotherDateQuestionPage', () => {
    it('should render question page', () => {

      getAddAnotherDateQuestionPage(req as Request, res as Response, next);

      const availableHearingDates = {
        from: moment().add(0, 'week').format(dayMonthYearFormat),
        to: moment().add(6, 'week').format(dayMonthYearFormat)
      };

      const expectedArgs = {
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        pageTitle: 'Is there another date that you or any witnesses cannot go to the hearing?',
        formAction: '/hearing-dates-avoid-new',
        question: {
          name: 'answer',
          title: `Is there another date between {{ availableHearingDates.from }} and {{ availableHearingDates.to }} that you or any witnesses cannot go to the hearing?`,
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        availableHearingDates: { from: availableHearingDates.from, to: availableHearingDates.to },
        saveAndContinueOnly: true
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAddAnotherDateQuestionPage', () => {
    it('should fail validation and render template with errors', async () => {
      postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk');
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.taskList);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      postAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
