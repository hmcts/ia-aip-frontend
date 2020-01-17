import { NextFunction, Request, Response } from 'express';
import { eligibilityQuestionGet, eligibilityQuestionPost } from '../../../app/controllers/eligibility';
import { paths } from '../../../app/paths';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Eligibility Controller', () => {
  let sandbox: sinon.SinonSandbox;

  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any
    };
    res = {
      render: sandbox.stub(),
      redirect: sinon.spy()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('load first question', () => {
    it('loads first question', () => {
      req.session.eligibility = {};
      eligibilityQuestionGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith('eligibility-question.njk', {
        question: i18n.eligibility[0].question,
        questionId: '0',
        previousPage: paths.start,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });

    it('loads another question', () => {
      req.query = { id: '1' };
      req.session.eligibility = {};

      eligibilityQuestionGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith('eligibility-question.njk', {
        question: i18n.eligibility[1].question,
        questionId: '1',
        previousPage: `${paths.eligibility}?id=0`,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });

    it('loads answer', () => {
      req.query = { id: '1' };
      req.session.eligibility = {
        '1': {
          answer: 'yes'
        }
      };

      eligibilityQuestionGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith('eligibility-question.njk', {
        question: i18n.eligibility[1].question,
        questionId: '1',
        previousPage: `${paths.eligibility}?id=0`,
        answer: 'yes',
        errors: undefined,
        errorList: undefined
      });
    });

    it('cannot skip eligibility questions', () => {
      req.query = { id: '3' };

      eligibilityQuestionGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith('eligibility-question.njk', {
        question: i18n.eligibility[0].question,
        questionId: '0',
        previousPage: paths.start,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });
  });

  describe('handles an answer', () => {
    it('redirects to next question if answer eligible', () => {
      req.body = {
        questionId: '0',
        answer: i18n.eligibility[0].eligibleAnswer
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(`${paths.eligibility}?id=1`);
    });

    it('redirects to ineligible page if answer ineligible', () => {
      req.body = {
        questionId: '0',
        answer: opposite(i18n.eligibility[0].eligibleAnswer)
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(paths.ineligibile);
    });

    it('redirects to eligible page if all answers eligible', () => {
      const finalQuestionId = i18n.eligibility.length - 1;
      req.body = {
        questionId: finalQuestionId + '',
        answer: i18n.eligibility[finalQuestionId].eligibleAnswer
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(paths.login);
    });

    it('stores answer in session', () => {
      req.body = {
        questionId: '0',
        answer: 'yes'
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response);

      expect(req.session.eligibility['0']).to.eql({ answer: 'yes' });
    });

    it('reload page if no option selected', () => {
      req.body = {
        questionId: '0'
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response);

      const error = { href: '#answer', key: 'answer', text: i18n.eligibility[0].errorMessage };
      expect(res.render).to.have.been.calledWith('eligibility-question.njk', {
        answer: undefined,
        errorList: [ error ],
        errors: { answer: error },
        previousPage: '/start',
        question: i18n.eligibility[0].question,
        questionId: '0'
      });
    });
  });
});

function opposite(yesOrNo) {
  return yesOrNo === 'yes' ? 'no' : 'yes';
}
