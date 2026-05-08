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
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any
    };

    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();
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
      expect(routerGetStub.calledWith(paths.common.questions)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.common.questions)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.eligible)).to.equal(true);
      expect(routerGetStub.calledWith(paths.common.ineligible)).to.equal(true);
    });
  });

  describe('load first question', () => {

    it('loads first question ooc feature flag', async () => {

      req.session.eligibility = {};
      await eligibilityQuestionGet(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('eligibility/eligibility-question.njk', {
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

  });

  describe('handles an answer', () => {

    it('redirects to eligible page if all answers eligible OOC', async () => {
      const finalQuestionId = i18n.eligibilityOOCFlag.length - 1;
      req.body = {
        questionId: finalQuestionId + '',
        answer: i18n.eligibilityOOCFlag[finalQuestionId].eligibleAnswer
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      expect(redirectStub.calledWith(`${paths.common.eligible}?id=${finalQuestionId}`)).to.equal(true);
    });

    it('stores answer in session', async () => {
      req.body = {
        questionId: '0',
        answer: 'yes'
      };
      req.session.eligibility = {};

      await eligibilityQuestionPost(req as Request, res as Response, next);

      expect(req.session.eligibility['0']).to.deep.equal({ answer: 'yes' });
    });
  });

  describe('getEligible', () => {
    it('should render the view', () => {
      req.query = { id: '123' };
      req.session.eligibility = {};

      getEligible(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('eligibility/eligible-page.njk',
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
      expect(next).to.be.calledWithMatch(sinon.match(expectedErr));
    });

    it('should redirect to first question if the users has gone directly to the eligible page', () => {
      getEligible(req as Request, res as Response, next);
      expect(redirectStub.calledWith(paths.common.questions)).to.equal(true);
    });
  });

  describe('getIneligible', () => {

    it('should render the view OOC', async () => {
      req.query = { id: '0' };
      const questionId: string = req.query.id as string;
      await getIneligible(req as Request, res as Response, next);
      expect(renderStub).to.be.calledWith('eligibility/ineligible-page.njk',
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
      expect(next).to.be.calledWithMatch(sinon.match(expectedErr));
    });
  });
});

function opposite(yesOrNo) {
  return yesOrNo === 'yes' ? 'no' : 'yes';
}
