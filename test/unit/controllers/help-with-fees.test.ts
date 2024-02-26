import { NextFunction, Request, Response } from 'express';
import {
  getApplyOption,
  getHelpWithFees,
  getHelpWithFeesRedirectPage,
  postHelpWithFees,
  setupHelpWithFeesController
} from '../../../app/controllers/appeal-application/help-with-fees';
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

describe('Help with fees Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let pcqService: Partial<PcqService>;
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
    pcqService = { checkPcqHealth: sandbox.stub(), getPcqId: sandbox.stub() };

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

  describe('setupHelpWithFeesController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupHelpWithFeesController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.helpWithFees);
      expect(routerPostStub).to.have.been.calledWith(paths.appealStarted.helpWithFees);
    });
  });

  describe('getApplyOption', () => {
    it('should return the question', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      const expectedQuestion = {
        hint: i18n.pages.helpWithFees.radioButtonsTitle,
        options: [
          {
            value: i18n.pages.helpWithFees.options.wantToApply.value,
            text: i18n.pages.helpWithFees.options.wantToApply.text,
            checked: false
          },
          {
            value: i18n.pages.helpWithFees.options.alreadyApplied.value,
            text: i18n.pages.helpWithFees.options.alreadyApplied.text,
            checked: false
          },
          {
            value: i18n.pages.helpWithFees.options.willPayForAppeal.value,
            text: i18n.pages.helpWithFees.options.willPayForAppeal.text,
            checked: false
          }
        ],
        inline: false
      };
      const question = getApplyOption(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const expectedQuestion = {
        hint: i18n.pages.helpWithFees.radioButtonsTitle,
        options: [
          {
            value: i18n.pages.helpWithFees.options.wantToApply.value,
            text: i18n.pages.helpWithFees.options.wantToApply.text,
            checked: true
          },
          {
            value: i18n.pages.helpWithFees.options.alreadyApplied.value,
            text: i18n.pages.helpWithFees.options.alreadyApplied.text,
            checked: false
          },
          {
            value: i18n.pages.helpWithFees.options.willPayForAppeal.value,
            text: i18n.pages.helpWithFees.options.willPayForAppeal.text,
            checked: false
          }
        ],
        inline: false
      };

      req.session.appeal.application.helpWithFeesOption = 'wantToApply';
      const question = getApplyOption(req.session.appeal);
      expect(question).to.be.eql(expectedQuestion);
    });
  });

  describe('getHelpWithFees', () => {
    it('getFeeSupport should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getHelpWithFees(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getHelpWithFees(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should render fee-support.njk template with feature flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await getHelpWithFees(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/help-with-fees.njk', {
        previousPage: paths.appealStarted.feeSupport,
        formAction: paths.appealStarted.helpWithFees,
        question: sinon.match.any,
        saveAndContinue: true
      });
    });

    it('should redirect to correct path according to the asylum support selected value', async () => {
      const testData = [
        {
          input: 'wantToApply',
          expected: paths.appealStarted.stepsToApplyForHelpWithFees,
          description: 'Steps to apply for help with fees page'
        },
        {
          input: 'alreadyApplied',
          expected: paths.appealStarted.helpWithFeesReferenceNumber,
          description: 'Help with fees reference number page'
        },
        {
          input: 'willPayForAppeal',
          expected: paths.appealStarted.taskList,
          description: 'Task list page'
        }
      ];

      testData.forEach(({ input, expected, description }) => {
        it(`should be ${description}`, () => {
          const result = getHelpWithFeesRedirectPage(input);
          expect(result).to.deep.equal(expected);
        });
      });
    });
  });

  describe('postHelpWithFees', () => {
    it('should redirect to the asylum support page', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body['answer'] = 'wantToApply';
      await postHelpWithFees(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealStarted.stepsToApplyForHelpWithFees);
    });

    it('should fail validation and render appeal-application/fee-support/help-with-fees.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body = { 'button': 'save-and-continue' };

      const error: ValidationError = {
        key: 'answer',
        text: 'Select if you want to apply for Help with Fees',
        href: '#answer'
      };

      await postHelpWithFees(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnce.calledWith(
        'appeal-application/fee-support/help-with-fees.njk',
        {
          errors: {
            answer: error
          },
          errorList: [error],
          previousPage: paths.appealStarted.feeSupport,
          pageTitle: i18n.pages.helpWithFees.title,
          question: sinon.match.any,
          formAction: paths.appealStarted.helpWithFees,
          saveAndContinue: true
        });
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body = {
        'saveForLater': 'saveForLater'
      };

      await postHelpWithFees(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postHelpWithFees(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postHelpWithFees(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should reset values from other journeys if it present', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body = {
        'answer': 'wantToApply',
        'asylumSupportRefNumber': 'test helpWithFeesOption',
        'helpWithFeesRefNumber': 'test helpWithFeesRefNumber',
        'localAuthorityLetters': 'test localAuthorityLetter'
      };

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          helpWithFeesOption: 'wantToApply'
        }
      };

      await postHelpWithFees(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
    });
  });
});
