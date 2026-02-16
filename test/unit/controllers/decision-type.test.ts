import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  getDecisionType,
  getDecisionTypeQuestion,
  postDecisionType,
  setupDecisionTypeController
} from '../../../app/controllers/appeal-application/decision-type';
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

describe('Type of appeal Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let pcqService: Partial<PcqService>;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<session.Session>,
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

    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = { submitEventRefactored: submitStub } as Partial<UpdateAppealService>;
    pcqService = { checkPcqHealth: sandbox.stub(), getPcqId: sandbox.stub() };

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDecisionTypeController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupDecisionTypeController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.appealStarted.decisionType)).to.equal(true);
      expect(routerPostStub.calledWith(paths.appealStarted.decisionType)).to.equal(true);
    });
  });

  describe('getDecisionTypeQuestion', () => {

    it('should return the question', () => {
      const expectedQuestion = {
        title: i18n.pages.decisionTypePage.title,
        hint: i18n.pages.decisionTypePage.hint.withFee,
        options: [
          {
            value: i18n.pages.decisionTypePage.options.withHearing.value,
            text: i18n.pages.decisionTypePage.options.withHearing.text,
            checked: false
          },
          {
            value: i18n.pages.decisionTypePage.options.withoutHearing.value,
            text: i18n.pages.decisionTypePage.options.withoutHearing.text,
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      const question = getDecisionTypeQuestion(req.session.appeal, false);

      expect(question).to.deep.equal(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      const expectedQuestion = {
        title: i18n.pages.decisionTypePage.title,
        hint: i18n.pages.decisionTypePage.hint.withoutFee,
        options: [
          {
            value: i18n.pages.decisionTypePage.options.withHearing.value,
            text: i18n.pages.decisionTypePage.options.withHearing.text,
            checked: true
          },
          {
            value: i18n.pages.decisionTypePage.options.withoutHearing.value,
            text: i18n.pages.decisionTypePage.options.withoutHearing.text,
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'deprivation';
      req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
      const question = getDecisionTypeQuestion(req.session.appeal, false);

      expect(question).to.deep.equal(expectedQuestion);
    });

    it('should return the question hint text with fee when drlm flag is turned on', () => {
      const expectedQuestion = {
        title: i18n.pages.decisionTypePage.title,
        hint: i18n.pages.decisionTypePage.hintWithDrlmSetAsideFlag.withFee,
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      const question = getDecisionTypeQuestion(req.session.appeal, true);

      expect(question.hint).to.equal(expectedQuestion.hint);
    });

    it('should return the question hint text without fee when drlm flag is turned on', () => {
      const expectedQuestion = {
        title: i18n.pages.decisionTypePage.title,
        hint: i18n.pages.decisionTypePage.hintWithDrlmSetAsideFlag.withoutFee,
        inline: false
      };
      req.session.appeal.application.appealType = 'deprivation';
      const question = getDecisionTypeQuestion(req.session.appeal, true);

      expect(question.hint).to.equal(expectedQuestion.hint);
    });
  });

  describe('getDecisionType', () => {
    it('should redirect to overview page when card payment feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
      await getDecisionType(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
    });

    it('should render radio-question-page.njk template with payments feature flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      await getDecisionType(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('templates/radio-question-page.njk', {
        previousPage: paths.appealStarted.taskList,
        pageTitle: i18n.pages.decisionTypePage.title,
        formAction: paths.appealStarted.decisionType,
        question: sinon.match.any,
        saveAndContinue: true
      });
    });

    it('should redirect to the pay-now page when payments feature flag ON and appealType is protection', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
          .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'protection';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.appealStarted.payNow)).to.equal(true);
    });

    it('should redirect to the task-list page when payments feature flag ON but PCQ feature flag OFF and appealType is not protection', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
          .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
          .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(false);
      req.body['answer'] = 'decisionWithoutHearing';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should redirect to the task-list page when payments feature flag ON but PCQ feature flag ON and appealType is not protection, PCQ is Down', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
          .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
          .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(true);
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      sandbox.stub(PcqService.prototype, 'checkPcqHealth').resolves(false);
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should redirect to the task-list page when payments feature flag ON, PCQ feature flag ON, appealType is not protection, but there is pcqId', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
          .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
          .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(true);
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      req.session.appeal.pcqId = 'AAA';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should redirect to the PCQ page when payments feature flag ON but PCQ feature flag ON and appealType is not protection, PCQ is Up', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
          .withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true)
          .withArgs(req as Request, FEATURE_FLAGS.PCQ, false).resolves(true);
      sandbox.stub(PcqService.prototype, 'checkPcqHealth').resolves(true);
      sandbox.stub(PcqService.prototype, 'getPcqId').resolves('test001');

      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(redirectStub.calledOnceWith(sinon.match('pcq'))).to.equal(true);
    });

    it('getDecisionType should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getDecisionType(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postDecisionType', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          appealType: 'revocationOfProtection',
          rpDcAppealHearingOption: 'decisionWithHearing',
          decisionHearingFeeOption: ''
        }
      };

      updateAppealService.submitEventRefactored = submitStub = sandbox.stub();
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    });

    it('should fail validation and call render with errors', async () => {
      req.body['answer'] = '';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(renderStub.calledOnceWith('templates/radio-question-page.njk')).to.equal(true);
    });

    it('should validate and redirect to the task-list page for revocationOfProtection appeal type', async () => {
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
      appeal.application.decisionHearingFeeOption = '';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('should validate and redirect to the task-list page for refusalOfHumanRights appeal type', async () => {
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'refusalOfHumanRights';
      appeal.application.appealType = 'refusalOfHumanRights';
      appeal.application.rpDcAppealHearingOption = '';
      appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledOnceWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('getDecisionType should catch exception and call next with the error', async () => {
      req.body['answer'] = 'decisionWithHearing';
      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  it('should redirect to overview page when feature flag OFF', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
    await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
  });
});
