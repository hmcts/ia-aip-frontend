import { NextFunction, Request, Response } from 'express';
import { eligibilityQuestionGet, eligibilityQuestionPost, getEligible, getIneligible } from '../../../app/controllers/eligibility';
import { paths } from '../../../app/paths';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Eligibility Controller', () => {
  let sandbox: sinon.SinonSandbox;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any
    };
    res = {
      render: sandbox.stub(),
      redirect: sinon.spy()
    };

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('load first question', () => {
    it('loads first question', () => {
      req.session.eligibility = {};
      eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[0].question,
        description: i18n.eligibility[0].description,
        questionId: '0',
        previousPage: paths.start,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });

    it('loads another question', () => {
      req.query = { id: '2' };
      req.session.eligibility = {};

      eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[2].question,
        description: i18n.eligibility[2].description,
        questionId: '2',
        previousPage: `${paths.eligibility.questions}?id=1`,
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

      eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[1].question,
        description: i18n.eligibility[1].description,
        questionId: '1',
        previousPage: `${paths.eligibility.questions}?id=0`,
        answer: 'yes',
        errors: undefined,
        errorList: undefined
      });
    });

    it('cannot skip eligibility questions', () => {
      req.query = { id: '3' };

      eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[0].question,
        description: i18n.eligibility[0].description,
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

      eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.eligibility.questions}?id=1`);
    });

    it('redirects to next question if answer eligible without skip', () => {
      req.body = {
        questionId: '6',
        answer: 'yes'
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.eligibility.questions}?id=7`);
    });

    it('redirects to next question with skip', () => {
      req.body = {
        questionId: '6',
        answer: 'no'
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.eligibility.eligible}?id=6`);
    });

    it('redirects to ineligible page if answer ineligible', () => {
      req.body = {
        questionId: '0',
        answer: opposite(i18n.eligibility[0].eligibleAnswer)
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.eligibility.ineligible}?id=0`);
    });

    it('redirects to eligible page if all answers eligible', () => {
      const finalQuestionId = i18n.eligibility.length - 1;
      req.body = {
        questionId: finalQuestionId + '',
        answer: i18n.eligibility[finalQuestionId].eligibleAnswer
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.eligibility.eligible}?id=${finalQuestionId}`);
    });

    it('stores answer in session', () => {
      req.body = {
        questionId: '0',
        answer: 'yes'
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response, next);

      expect(req.session.eligibility['0']).to.eql({ answer: 'yes' });
    });

    it('reload page if no option selected', () => {
      req.body = {
        questionId: '0'
      };
      req.session.eligibility = {};

      eligibilityQuestionPost(req as Request, res as Response, next);

      const error = { href: '#answer', key: 'answer', text: i18n.eligibility[0].errorMessage };
      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        answer: undefined,
        errorList: [ error ],
        errors: { answer: error },
        previousPage: '/start',
        question: i18n.eligibility[0].question,
        questionId: '0'
      });
    });
  });

  describe('getEligible', () => {
    it('should render the view', () => {
      req.query = { id: '123' };
      req.session.eligibility = {};

      getEligible(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('eligibility/eligible-page.njk',
        {
          previousPage: `${paths.eligibility.questions}?id=123`
        }
      );
    });

    it('should catch exception and call next with the error', function () {
      req.session.eligibility = {};
      const error = new TypeError('Cannot read property \'id\' of undefined');

      const expectedErr = sinon.match.instanceOf(TypeError)
        .and(sinon.match.has('message', 'Cannot read property \'id\' of undefined'));
      getEligible(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWithMatch(sinon.match(expectedErr));
    });

    it('should redirect to first question if the users has gone directly to the eligible page', () => {
      getEligible(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.eligibility.questions);
    });
  });

  describe('getIneligible', () => {
    it('should render the view', () => {
      req.query = { id: '123' };
      getIneligible(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('eligibility/ineligible-page.njk',
        {
          previousPage: `${paths.eligibility.questions}?id=123`
        }
      );
    });

    it('should catch exception and call next with the error', function () {
      const error = new TypeError('Cannot read property \'id\' of undefined');

      const expectedErr = sinon.match.instanceOf(TypeError)
        .and(sinon.match.has('message', 'Cannot read property \'id\' of undefined'));
      getIneligible(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWithMatch(sinon.match(expectedErr));
    });
  });
});

function opposite(yesOrNo) {
  return yesOrNo === 'yes' ? 'no' : 'yes';
}
