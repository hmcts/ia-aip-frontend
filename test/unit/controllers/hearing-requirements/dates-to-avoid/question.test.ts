import express, { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getDatesToAvoidQuestion, getPageTitle, getQuestion,
  postDatesToAvoidQuestion,
  setupHearingDatesToAvoidQuestionController
} from '../../../../../app/controllers/hearing-requirements/dates-to-avoid/question';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { dayMonthYearFormat } from '../../../../../app/utils/date-utils';
import i18n from '../../../../../locale/en.json';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          application: {},
          directions: [],
          hearingRequirements: {
            datesToAvoid: {}
          }
        } as Partial<Appeal>
      }
    } as Partial<Request>;
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;

  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDatesToAvoidQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingDatesToAvoidQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.datesToAvoidQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.datesToAvoidQuestion)).to.equal(true);
    });
  });

  describe('getDatesToAvoidQuestion', () => {
    it('should render question page', () => {

      getDatesToAvoidQuestion(req as Request, res as Response, next);

      const availableHearingDates = {
        from: moment().add(0, 'week').format(dayMonthYearFormat),
        to: moment().add(6, 'week').format(dayMonthYearFormat)
      };

      const expectedArgs = {
        formAction: '/hearing-dates-avoid',
        pageTitle: 'Are there any dates that you or any witnesses cannot go to the hearing?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Are there any dates between {{ availableHearingDates.from }} and {{ availableHearingDates.to }} that you or any witnesses cannot go to the hearing?',
          hint: 'You will need to tell us why you or any witnesses cannot go to the hearing on the dates you include.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        availableHearingDates,
        saveAndContinue: true
      };
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getDatesToAvoidQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postDatesToAvoidQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          key: 'answer',
          text: 'Select yes if there are any dates you cannot go to the hearing',
          href: '#answer'
        }
      };

      const availableHearingDates = {
        from: moment().add(0, 'week').format(dayMonthYearFormat),
        to: moment().add(6, 'week').format(dayMonthYearFormat)
      };

      const expectedArgs = {
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        pageTitle: 'Are there any dates that you or any witnesses cannot go to the hearing?',
        formAction: '/hearing-dates-avoid',
        question: {
          name: 'answer',
          title: 'Are there any dates between {{ availableHearingDates.from }} and {{ availableHearingDates.to }} that you or any witnesses cannot go to the hearing?',
          hint: 'You will need to tell us why you or any witnesses cannot go to the hearing on the dates you include.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        availableHearingDates,
        saveAndContinue: true,
        error: expectedError,
        errorList: Object.values(expectedError)

      };
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.hearingRequirements.datesToAvoid.isDateCannotAttend).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate)).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.hearingRequirements.datesToAvoid.isDateCannotAttend).to.equal(false);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.taskList)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postDatesToAvoidQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
  
  describe('getPageTitle', () => {
    it('should return correct page title if hasNonLegalRep is true', () => {
      const pageTitle = getPageTitle(true);
      expect(pageTitle).to.equal(i18n.pages.hearingRequirements.datesToAvoidSection.questionPageNlr.title);
    });

    it('should return correct page title if hasNonLegalRep is false', () => {
      const pageTitle = getPageTitle(false);
      expect(pageTitle).to.equal(i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.title);
    });
  });

  describe('getQuestion', () => {
    it('should return correct question if hasNonLegalRep Yes without isDateCannotAttend', () => {
      req.session.appeal.application.hasNonLegalRep = 'Yes';
      const question = getQuestion(req.session.appeal);
      expect(question).to.deep.equal(
        {
          name: 'answer',
          title: i18n.pages.hearingRequirements.datesToAvoidSection.questionPageNlr.question,
          hint: i18n.pages.hearingRequirements.datesToAvoidSection.questionPageNlr.description,
          options: [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]
        }
      );
    });

    it('should return correct question if hasNonLegalRep No with isDateCannotAttend true', () => {
      req.session.appeal.hearingRequirements.datesToAvoid.isDateCannotAttend = true;
      const question = getQuestion(req.session.appeal);
      expect(question).to.deep.equal(
        {
          name: 'answer',
          title: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.question,
          hint: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.description,
          options: [{ value: 'yes', text: 'Yes', checked: true }, { value: 'no', text: 'No', checked: false }]
        }
      );
    });

    it('should return correct question if hasNonLegalRep No with isDateCannotAttend false', () => {
      req.session.appeal.hearingRequirements.datesToAvoid.isDateCannotAttend = false;
      const question = getQuestion(req.session.appeal);
      expect(question).to.deep.equal(
        {
          name: 'answer',
          title: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.question,
          hint: i18n.pages.hearingRequirements.datesToAvoidSection.questionPage.description,
          options: [{ value: 'yes', text: 'Yes', checked: false }, { value: 'no', text: 'No', checked: true }]
        }
      );
    });
  });
});
