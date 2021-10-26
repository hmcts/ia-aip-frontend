import { NextFunction, Request, Response } from 'express';
import {
  getDecisionType,
  getDecisionTypeQuestion,
  postDecisionType,
  SetupDecisionTypeController
} from '../../../app/controllers/appeal-application/decision-type';
import { appealTypes } from '../../../app/data/appeal-types';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
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

  describe('SetupDecisionTypeController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      new SetupDecisionTypeController().initialise(middleware, updateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.decisionType);
      expect(routerPostStub).to.have.been.calledWith(paths.appealStarted.decisionType);
    });
  });

  describe('getDecisionTypeQuestion', () => {
    it('should return the question', () => {
      const expectedQuestion = {
        title: i18n.pages.decisionType.title,
        hint: i18n.pages.decisionType.hint.withFee,
        options: [
          {
            value: i18n.pages.decisionType.options.withHearing.value,
            text: i18n.pages.decisionType.options.withHearing.text,
            checked: false
          },
          {
            value: i18n.pages.decisionType.options.withoutHearing.value,
            text: i18n.pages.decisionType.options.withoutHearing.text,
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      const question = getDecisionTypeQuestion(req.session.appeal.application);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      const expectedQuestion = {
        title: i18n.pages.decisionType.title,
        hint: i18n.pages.decisionType.hint.withoutFee,
        options: [
          {
            value: i18n.pages.decisionType.options.withHearing.value,
            text: i18n.pages.decisionType.options.withHearing.text,
            checked: true
          },
          {
            value: i18n.pages.decisionType.options.withoutHearing.value,
            text: i18n.pages.decisionType.options.withoutHearing.text,
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'deprivation';
      req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
      const question = getDecisionTypeQuestion(req.session.appeal.application);

      expect(question).to.be.eql(expectedQuestion);
    });
  });

  describe('getDecisionType', () => {
    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'online-card-payments-feature', false).resolves(false);
      await getDecisionType(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should render radio-question-page.njk template with payments feature flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'online-card-payments-feature', false).resolves(true);
      await getDecisionType(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk', {
        previousPage: paths.appealStarted.typeOfAppeal,
        pageTitle: i18n.pages.decisionType.title,
        formAction: paths.appealStarted.decisionType,
        question: sinon.match.any,
        saveAndContinue: true
      });
    });

    it('getDecisionType should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getDecisionType(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
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

      updateAppealService.submitEventRefactored = sandbox.stub();
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'online-card-payments-feature', false).resolves(true);
    });

    it('should fail validation and call render with errors', async () => {
      req.body['answer'] = '';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('templates/radio-question-page.njk');
    });

    it('should validate and redirect to the task-list page for revocationOfProtection appeal type', async () => {
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'revocationOfProtection';
      appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
      appeal.application.decisionHearingFeeOption = '';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('should validate and redirect to the task-list page for refusalOfHumanRights appeal type', async () => {
      req.body['answer'] = 'decisionWithHearing';
      req.session.appeal.application.appealType = 'refusalOfHumanRights';
      appeal.application.appealType = 'refusalOfHumanRights';
      appeal.application.rpDcAppealHearingOption = '';
      appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.taskList);
    });

    it('getDecisionType should catch exception and call next with the error', async () => {
      req.body['answer'] = 'decisionWithHearing';
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      await postDecisionType(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
