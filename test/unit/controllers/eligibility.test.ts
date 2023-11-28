import { NextFunction, Request, Response } from 'express';
import { eligibilityQuestionGet, eligibilityQuestionPost, getEligible, getIneligible, setupEligibilityController } from '../../../app/controllers/eligibility';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Type of appeal Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

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
    LaunchDarklyService.close();
  });

  describe('setupEligibilityController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupEligibilityController();
      expect(routerGetStub).to.have.been.calledWith(paths.common.questions);
      expect(routerPOSTStub).to.have.been.calledWith(paths.common.questions);
      expect(routerGetStub).to.have.been.calledWith(paths.common.eligible);
      expect(routerGetStub).to.have.been.calledWith(paths.common.ineligible);
    });
  });

  describe('load first question', () => {
    it('loads first question', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.session.eligibility = {};
      await eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[0].question,
        description: i18n.eligibility[0].description,
        modal: i18n.eligibility[0].modal,
        questionId: '0',
        previousPage: paths.common.start,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });

    it('loads first question ooc feature flag', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(true);

      req.session.eligibility = {};
      await eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibilityOOCFlag[0].question,
        description: i18n.eligibilityOOCFlag[0].description,
        modal: i18n.eligibilityOOCFlag[0].modal,
        questionId: '0',
        previousPage: paths.common.start,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });

    it('loads another question', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.query = { id: '2' };
      req.session.eligibility = {};

      await eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[2].question,
        description: i18n.eligibility[2].description,
        modal: i18n.eligibility[2].modal,
        questionId: '2',
        previousPage: `${paths.common.questions}?id=1`,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });

    it('loads answer', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.query = { id: '1' };
      req.session.eligibility = {
        '1': {
          answer: 'yes'
        }
      };

      await eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[1].question,
        description: i18n.eligibility[1].description,
        modal: i18n.eligibility[1].modal,
        questionId: '1',
        previousPage: `${paths.common.questions}?id=0`,
        answer: 'yes',
        errors: undefined,
        errorList: undefined
      });
    });

    it('cannot skip eligibility questions', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.query = { id: '3' };

      await eligibilityQuestionGet(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[0].question,
        description: i18n.eligibility[0].description,
        modal: i18n.eligibility[0].modal,
        questionId: '0',
        previousPage: paths.common.start,
        answer: '',
        errors: undefined,
        errorList: undefined
      });
    });
  });

  describe('handles an answer', () => {
    it('redirects to next question if answer eligible', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.body = {
        questionId: '0',
        answer: i18n.eligibility[0].eligibleAnswer
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.questions}?id=1`);
    });

    it('redirects to ineligible page if answer ineligible', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.body = {
        questionId: '0',
        answer: opposite(i18n.eligibility[0].eligibleAnswer)
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.ineligible}?id=0`);
    });

    it('redirects to eligible page if all answers eligible', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      const finalQuestionId = i18n.eligibility.length - 1;
      req.body = {
        questionId: finalQuestionId + '',
        answer: i18n.eligibility[finalQuestionId].eligibleAnswer
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.eligible}?id=${finalQuestionId}`);
    });

    it('stores answer in session', async () => {
      req.body = {
        questionId: '0',
        answer: 'yes'
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      expect(req.session.eligibility['0']).to.eql({ answer: 'yes' });
    });

    it('reload page if no option selected', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(null, 'aip-ooc-feature', false).resolves(false);
      req.body = {
        questionId: '2'
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      const error = { href: '#answer', key: 'answer', text: i18n.eligibility[2].errorMessage };
      expect(res.render).to.have.been.calledWith('eligibility/eligibility-question.njk', {
        answer: undefined,
        errorList: [error],
        errors: { answer: error },
        previousPage: '/eligibility?id=1',
        question: i18n.eligibility[2].question,
        description: i18n.eligibility[2].description,
        modal: i18n.eligibility[0].modal,
        questionId: '2'
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
          previousPage: `${paths.common.questions}?id=123`
        }
      );
    });

    it('should catch exception and call next with the error', function () {
      req.session.eligibility = {};
      const error = new TypeError('Cannot read properties of undefined (reading \'id\')');

      const expectedErr = sinon.match.instanceOf(TypeError)
        .and(sinon.match.has('message', 'Cannot read properties of undefined (reading \'id\')'));
      getEligible(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWithMatch(sinon.match(expectedErr));
    });

    it('should redirect to first question if the users has gone directly to the eligible page', () => {
      getEligible(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.questions);
    });
  });

  describe('getIneligible', () => {
    it('should render the view', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(false);
      req.query = { id: '0' };
      const questionId: string = req.query.id as string;
      await getIneligible(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('eligibility/ineligible-page.njk',
        {
          title: i18n.ineligible[questionId].title,
          description: i18n.ineligible[questionId].description,
          optionsList: i18n.ineligible[questionId].optionsList,
          previousPage: `${paths.common.questions}?id=0`
        }
      );
    });

    it('should render the view OOC', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(true);
      req.query = { id: '0' };
      const questionId: string = req.query.id as string;
      await getIneligible(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('eligibility/ineligible-page.njk',
        {
          title: i18n.ineligible[questionId].title,
          description: i18n.ineligible[questionId].description,
          optionsList: i18n.ineligible[questionId].optionsList,
          previousPage: `${paths.common.questions}?id=0`
        }
      );
    });

    it('should catch exception and call next with the error', async function () {
      const error = new TypeError('Cannot read properties of undefined (reading \'id\')');

      const expectedErr = sinon.match.instanceOf(TypeError)
        .and(sinon.match.has('message', 'Cannot read properties of undefined (reading \'id\')'));
      await getIneligible(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWithMatch(sinon.match(expectedErr));
    });
  });
});

function opposite(yesOrNo) {
  return yesOrNo === 'yes' ? 'no' : 'yes';
}
