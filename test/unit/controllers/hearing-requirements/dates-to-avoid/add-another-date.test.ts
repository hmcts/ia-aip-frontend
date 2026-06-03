import express, { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { SinonStub } from 'sinon';
import {
  getAddAnotherDateQuestionPage, postAddAnotherDateQuestionPage,
  setupHearingDatesToAvoidAddAnotherDateController, getQuestion, getPageTitle
} from '../../../../../app/controllers/hearing-requirements/dates-to-avoid/add-another-date';
import { paths } from '../../../../../app/paths';
import { dayMonthYearFormat } from '../../../../../app/utils/date-utils';
import i18n from '../../../../../locale/en.json';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Add Another Date Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonSpy;
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
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();
    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.hearingDateToAvoidNew)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.hearingDateToAvoidNew)).to.equal(true);
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
          title: 'Is there another date between {{ availableHearingDates.from }} and {{ availableHearingDates.to }} that you or any witnesses cannot go to the hearing?',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        availableHearingDates: { from: availableHearingDates.from, to: availableHearingDates.to },
        saveAndContinueOnly: true
      };
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postAddAnotherDateQuestionPage', () => {
    it('should fail validation and render template with errors', async () => {
      postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(renderStub.calledWith('templates/radio-question-page.njk')).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate)).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      postAddAnotherDateQuestionPage(req as Request, res as Response, next);

      expect(redirectStub.calledWith(paths.submitHearingRequirements.taskList)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      postAddAnotherDateQuestionPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('getPageTitle', () => {
    it('should return correct page title if hasNonLegalRep is true', () => {
      const pageTitle = getPageTitle(true);
      expect(pageTitle).to.equal(i18n.pages.hearingRequirements.datesToAvoidSection.addAnotherDateQuestionNlr.title);
    });

    it('should return correct page title if hasNonLegalRep is false', () => {
      const pageTitle = getPageTitle(false);
      expect(pageTitle).to.equal(i18n.pages.hearingRequirements.datesToAvoidSection.addAnotherDateQuestion.title);
    });
  });

  describe('getQuestion', () => {
    it('should return correct question if hasNonLegalRep is true', () => {
      const question = getQuestion(true);
      expect(question).to.deep.equal(
        {
          name: 'answer',
          title: i18n.pages.hearingRequirements.datesToAvoidSection.addAnotherDateQuestionNlr.heading,
          options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
        }
      );
    });

    it('should return correct question if hasNonLegalRep is false', () => {
      const question = getQuestion(false);
      expect(question).to.deep.equal(
        {
          name: 'answer',
          title: i18n.pages.hearingRequirements.datesToAvoidSection.addAnotherDateQuestion.heading,
          options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
        }
      );
    });
  });
});
