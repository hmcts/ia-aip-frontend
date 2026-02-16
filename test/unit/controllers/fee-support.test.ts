import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  getFeeSupport,
  getFeeSupportRedirectPage,
  getRemissionOptionsQuestion,
  postFeeSupport,
  setupFeeSupportController
} from '../../../app/controllers/appeal-application/fee-support';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import PcqService from '../../../app/service/pcq-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Fee support Controller', () => {
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

  describe('setupFeeSupportController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupFeeSupportController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.appealStarted.feeSupport)).to.equal(true);
      expect(routerPostStub.calledWith(paths.appealStarted.feeSupport)).to.equal(true);
    });
  });

  describe('getRemissionOptionsQuestion', () => {
    it('should return the question', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';

      const expectedQuestion = {
        title: i18n.pages.remissionOptionPage.title,
        hint: i18n.pages.remissionOptionPage.hint.replace('{{ fee }}', '140'),
        options: [
          {
            value: i18n.pages.remissionOptionPage.options.asylumSupportFromHo.value,
            text: i18n.pages.remissionOptionPage.options.asylumSupportFromHo.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.feeWaiverFromHo.value,
            text: i18n.pages.remissionOptionPage.options.feeWaiverFromHo.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.value,
            text: i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.value,
            text: i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.value,
            text: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.text,
            hint: {
              text: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.hint
            },
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      const question = getRemissionOptionsQuestion(req.session.appeal);

      expect(question).to.deep.equal(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';

      const expectedQuestion = {
        title: i18n.pages.remissionOptionPage.title,
        hint: i18n.pages.remissionOptionPage.hint.replace('{{ fee }}', '140'),
        options: [
          {
            value: i18n.pages.remissionOptionPage.options.asylumSupportFromHo.value,
            text: i18n.pages.remissionOptionPage.options.asylumSupportFromHo.text,
            checked: true
          },
          {
            value: i18n.pages.remissionOptionPage.options.feeWaiverFromHo.value,
            text: i18n.pages.remissionOptionPage.options.feeWaiverFromHo.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.value,
            text: i18n.pages.remissionOptionPage.options.under18GetSupportFromLocalAuthority.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.value,
            text: i18n.pages.remissionOptionPage.options.parentGetSupportFromLocalAuthority.text,
            checked: false
          },
          {
            value: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.value,
            text: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.text,
            hint: {
              text: i18n.pages.remissionOptionPage.options.noneOfTheseStatements.hint
            },
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.remissionOption = 'asylumSupportFromHo';
      const question = getRemissionOptionsQuestion(req.session.appeal);

      expect(question).to.deep.equal(expectedQuestion);
    });
  });

  describe('getFeeSupport', () => {
    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getFeeSupport(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
    });

    it('should render fee-support.njk template with feature flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      await getFeeSupport(req as Request, res as Response, next);

      expect(renderStub).to.be.calledOnceWith('appeal-application/fee-support/fee-support.njk', {
        previousPage: paths.appealStarted.taskList,
        pageTitle: i18n.pages.remissionOptionPage.title,
        formAction: paths.appealStarted.feeSupport,
        question: sinon.match.any,
        saveAndContinue: true
      });
    });

    it('should redirect to the asylum support page', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body['answer'] = 'asylumSupportFromHo';
      req.session.appeal.application.appealType = 'protection';
      await postFeeSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.appealStarted.asylumSupport)).to.equal(true);
    });

    it('should redirect to correct path according to the asylum support selected value', async () => {
      const testData = [
        {
          input: 'asylumSupportFromHo',
          expected: paths.appealStarted.asylumSupport,
          description: 'Asylum support page'
        },
        {
          input: 'feeWaiverFromHo',
          expected: paths.appealStarted.feeWaiver,
          description: 'Fee waiver page'
        },
        {
          input: 'under18GetSupportFromLocalAuthority',
          expected: paths.appealStarted.localAuthorityLetter,
          description: 'Upload local authority letter page'
        },
        {
          input: 'parentGetSupportFromLocalAuthority',
          expected: paths.appealStarted.localAuthorityLetter,
          description: 'Upload local authority letter page'
        },
        {
          input: 'noneOfTheseStatements',
          expected: paths.appealStarted.helpWithFees,
          description: 'Help with fees page'
        }
      ];

      testData.forEach(({ input, expected, description }) => {
        it(`should be ${description}`, () => {
          const result = getFeeSupportRedirectPage(input);
          expect(result).to.deep.equal(expected);
        });
      });
    });

    it('getFeeSupport should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getFeeSupport(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postFeeSupport', () => {
    it('should fail validation and render appeal-application/fee-support/fee-support.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body = { 'button': 'save-and-continue' };
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';

      const error: ValidationError = {
        key: 'answer',
        text: 'Select the statement that applies to you',
        href: '#answer'
      };

      await postFeeSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.called).to.equal(false);
      expect(renderStub).to.be.calledOnceWith(
        'appeal-application/fee-support/fee-support.njk',
        {
          errors: {
            answer: error
          },
          errorList: [error],
          previousPage: paths.appealStarted.taskList,
          pageTitle: i18n.pages.remissionOptionPage.title,
          formAction: paths.appealStarted.feeSupport,
          question: sinon.match.any,
          saveAndContinue: true
        });
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body = {
        'asylumSupportRefNumber': '',
        'saveForLater': 'saveForLater',
        'feeWithHearing': '140',
        'decisionHearingFeeOption': 'decisionWithHearing'
      };

      await postFeeSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';

      const error = new Error('an error');
      res.render = renderStub.throws(error);
      await postFeeSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postFeeSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
    });
  });
});
