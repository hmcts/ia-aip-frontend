import { NextFunction, Request, Response } from 'express';
import {
  getPayNow,
  getPayNowQuestion,
  postPayNow,
  SetupPayNowController
} from '../../../app/controllers/appeal-application/pay-now';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import PcqService from '../../../app/service/pcq-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Pay now Controller @payNow', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    updateAppealService = { submitEventRefactored: sandbox.stub() };

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('SetupPayNowController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      new SetupPayNowController().initialise(middleware, updateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.payNow);
      expect(routerPostStub).to.have.been.calledWith(paths.appealStarted.payNow);
    });
  });

  describe('getPayNowQuestion', () => {
    it('should return the question', () => {
      const expectedQuestion = {
        title: i18n.pages.payNow.title,
        hint: i18n.pages.payNow.hint,
        options: [
          {
            value: i18n.pages.payNow.options.now.value,
            text: i18n.pages.payNow.options.now.text,
            checked: true
          },
          {
            value: i18n.pages.payNow.options.later.value,
            text: i18n.pages.payNow.options.later.text,
            checked: false
          }
        ]
      };
      req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';
      const question = getPayNowQuestion(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      const expectedQuestion = {
        title: i18n.pages.payNow.title,
        hint: i18n.pages.payNow.hint,
        options: [
          {
            value: i18n.pages.payNow.options.now.value,
            text: i18n.pages.payNow.options.now.text,
            checked: false
          },
          {
            value: i18n.pages.payNow.options.later.value,
            text: i18n.pages.payNow.options.later.text,
            checked: true
          }
        ]
      };
      req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
      const question = getPayNowQuestion(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });
  });

  describe('getPayNow', () => {
    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
      await getPayNow(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should render radio-question-page.njk template with payments feature flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      await getPayNow(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: paths.appealStarted.decisionType,
        pageTitle: i18n.pages.payNow.title,
        formAction: paths.appealStarted.payNow,
        question: sinon.match.any,
        saveAndContinue: true
      });
    });

    it('getPayNow should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getPayNow(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postPayNow', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal
      };

      updateAppealService.submitEventRefactored = sandbox.stub();
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    });

    it('should fail validation and call render with errors', async () => {
      req.body['answer'] = '';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk');
    });

    it('should validate and redirect to the task-list page for revocationOfProtection appeal type', async () => {
      req.body['answer'] = 'payNow';
      appeal.paAppealTypeAipPaymentOption = 'payNow';
      await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', true);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should validate and redirect to the task-list page for refusalOfHumanRights appeal type', async () => {
      req.body['answer'] = 'payLater';
      appeal.paAppealTypeAipPaymentOption = 'payLater';
      await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken', true);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('getDecisionType should catch exception and call next with the error', async () => {
      req.body['answer'] = 'decisionWithHearing';
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  it('should redirect to the task-list page when payments feature flag ON but PCQ feature flag OFF and appealType is protection', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
        .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(false);
    req.body['answer'] = 'decisionWithoutHearing';
    req.session.appeal.application.appealType = 'protection';
    await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
  });

  it('should redirect to the PCQ page when payments feature flag ON but PCQ feature flag ON and appealType is is protection, PCQ is Up', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
        .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(true);
    req.body['answer'] = 'decisionWithHearing';
    req.session.appeal.application.appealType = 'protection';
    sandbox.stub(PcqService.prototype, 'checkPcqHealth').resolves(true);
    sandbox.stub(PcqService.prototype, 'getPcqId').resolves('test001');
    await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(sinon.match('pcq'));
  });

  it('should redirect to the task-list page when payments feature flag ON but PCQ feature flag ON and appealType is is protection, PCQ is Down', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
        .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(true);
    req.body['answer'] = 'decisionWithHearing';
    req.session.appeal.application.appealType = 'protection';
    sandbox.stub(PcqService.prototype, 'checkPcqHealth').resolves(false);
    await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
  });

  it('should redirect to the task-list page when payments feature flag ON, PCQ feature flag ON, appealType is protection, but there is pcqId', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
        .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(true);
    req.body['answer'] = 'decisionWithHearing';
    req.session.appeal.application.appealType = 'protection';
    req.session.appeal.pcqId = 'AAA';
    await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
  });

  it('should redirect to overview page when feature flag OFF', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
    await postPayNow(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
  });

});
