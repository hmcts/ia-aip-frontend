import { NextFunction, Request, Response } from 'express';
import {
  getFeeSupport,
  getFeeSupportRedirectPage,
  getOptionsQuestion,
  postFeeSupport,
  setupFeeSupportRefundController
} from '../../../../app/controllers/ask-for-fee-remission/fee-support-refund';
import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import Logger from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Fee support refund Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
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

  describe('setupFeeSupportRefundController', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupFeeSupportRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.feeSupportRefund);
      expect(routerPostStub).to.have.been.calledWith(paths.appealSubmitted.feeSupportRefund);
    });

    it('should return the question', () => {
      const expectedQuestion = {
        title: i18n.pages.remissionOptionPage.refundTitle,
        hint: i18n.pages.remissionOptionPage.selectOne,
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
            value: i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.value,
            text: i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.text,
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      const question = getOptionsQuestion(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      const expectedQuestion = {
        title: i18n.pages.remissionOptionPage.refundTitle,
        hint: i18n.pages.remissionOptionPage.selectOne,
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
            value: i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.value,
            text: i18n.pages.remissionOptionPage.options.iWantToGetHelpWithFees.text,
            checked: false
          }
        ],
        inline: false
      };
      req.session.appeal.application.lateRemissionOption = 'asylumSupportFromHo';
      const question = getOptionsQuestion(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should render fee-support.njk template', async () => {
      await getFeeSupport(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('ask-for-fee-remission/fee-support-refund.njk', {
        previousPage: paths.common.overview,
        pageTitle: i18n.pages.remissionOptionPage.refundTitle,
        formAction: paths.appealSubmitted.feeSupportRefund,
        question: sinon.match.any
      });
    });

    it('should redirect to the asylum support page', async () => {
      req.body['answer'] = 'asylumSupportFromHo';
      req.session.appeal.application.appealType = 'protection';
      await postFeeSupport()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealSubmitted.asylumSupportRefund);
    });

    it('should redirect to correct path according to the asylum support selected value', async () => {
      const testData = [
        {
          input: 'asylumSupportFromHo',
          expected: paths.appealSubmitted.asylumSupportRefund,
          description: 'Asylum support page'
        },
        {
          input: 'feeWaiverFromHo',
          expected: paths.appealSubmitted.feeWaiverRefund,
          description: 'Fee waiver page'
        },
        {
          input: 'under18GetSupportFromLocalAuthority',
          expected: paths.appealSubmitted.localAuthorityLetterRefund,
          description: 'Upload local authority letter page'
        },
        {
          input: 'parentGetSupportFromLocalAuthority',
          expected: paths.appealSubmitted.localAuthorityLetterRefund,
          description: 'Upload local authority letter page'
        },
        {
          input: 'iWantToGetHelpWithFees',
          expected: paths.appealSubmitted.helpWithFeesRefund,
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

    it('should fail validation and render appeal-application/fee-support/fee-support.njk', async () => {
      const error = {
        key: 'answer',
        text: 'Select the statement that applies to you',
        href: '#answer'
      };

      await postFeeSupport()(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'ask-for-fee-remission/fee-support-refund.njk',
        {
          errors: {
            answer: error
          },
          errorList: [error],
          previousPage: paths.common.overview,
          pageTitle: i18n.pages.remissionOptionPage.refundTitle,
          formAction: paths.appealSubmitted.feeSupportRefund,
          question: sinon.match.any
        });
    });
  });

  describe('Asylum support refund Flag off validations', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(false);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postFeeSupport()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await getFeeSupport(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('getFeeSupport should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getFeeSupport(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
