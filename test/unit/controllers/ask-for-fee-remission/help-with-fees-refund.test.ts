import { NextFunction, Request, Response } from 'express';
import {
  getApplyOption,
  getHelpWithFees,
  getHelpWithFeesRedirectPage,
  postHelpWithFees,
  setupHelpWithFeesRefundController
} from '../../../../app/controllers/ask-for-fee-remission/help-with-fees-refund';
import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import Logger from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Help with fees refund Controller', () => {
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

  describe('setupHelpWithFeesRefundController', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.feeWithHearing = '140';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupHelpWithFeesRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.helpWithFeesRefund);
      expect(routerPostStub).to.have.been.calledWith(paths.appealSubmitted.helpWithFeesRefund);
    });

    it('should return the question', () => {
      const expectedQuestion = {
        title: i18n.pages.helpWithFees.radioButtonsTitle,
        helpWithFeesHint: i18n.pages.helpWithFees.refundsNote.replace('{{ fee }}', '140'),
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
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      const question = getApplyOption(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should return the question with option checked', () => {
      const expectedQuestion = {
        title: i18n.pages.helpWithFees.radioButtonsTitle,
        helpWithFeesHint: i18n.pages.helpWithFees.refundsNote.replace('{{ fee }}', '140'),
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
          }
        ],
        inline: false
      };
      req.session.appeal.application.appealType = 'protection';
      req.session.appeal.application.lateHelpWithFeesOption = 'wantToApply';
      const question = getApplyOption(req.session.appeal);

      expect(question).to.be.eql(expectedQuestion);
    });

    it('should render help-with-fees.njk template', async () => {
      await getHelpWithFees(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/help-with-fees.njk', {
        previousPage: paths.appealSubmitted.feeSupportRefund,
        formAction: paths.appealSubmitted.helpWithFeesRefund,
        question: sinon.match.any,
        continueCancelButtons: true,
        refundJourney: true
      });
    });

    it('should redirect to the steps to apply for help with fees page', async () => {
      req.body['answer'] = 'wantToApply';
      req.session.appeal.application.appealType = 'protection';
      await postHelpWithFees()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund);
    });

    it('when in edit mode should validate and redirect asylum-support-refund.njk and reset isEdit flag', async () => {
      req.body['answer'] = 'wantToApply';
      req.query = { 'edit': '' };
      await postHelpWithFees()(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateHelpWithFeesOption).to.be.eql('wantToApply');
      expect(res.redirect).to.have.been.calledWithMatch(new RegExp(`${paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund}(?!.*\\bedit\\b)`));
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('when called with edit param should render help-with-fees.njk and update session', async () => {
      req.query = { 'edit': '' };
      await getHelpWithFees(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/help-with-fees.njk');
    });

    it('should redirect to correct path according to the help with fees selected value', async () => {
      const testData = [
        {
          input: 'wantToApply',
          expected: paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund,
          description: 'Steps to apply for help with fees refund page'
        },
        {
          input: 'alreadyApplied',
          expected: paths.appealSubmitted.helpWithFeesReferenceNumberRefund,
          description: 'Help with fees reference number page'
        }
      ];

      testData.forEach(({ input, expected, description }) => {
        it(`should be ${description}`, () => {
          const result = getHelpWithFeesRedirectPage(input);
          expect(result).to.deep.equal(expected);
        });
      });
    });

    it('should fail validation and render appeal-application/fee-support/help-with-fees.njk', async () => {
      const error = {
        key: 'answer',
        text: i18n.validationErrors.helpWithFees,
        href: '#answer'
      };

      await postHelpWithFees()(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'appeal-application/fee-support/help-with-fees.njk',
        {
          errors: {
            answer: error
          },
          errorList: [error],
          previousPage: paths.appealSubmitted.feeSupportRefund,
          pageTitle: i18n.pages.helpWithFees.title,
          question: getApplyOption(req.session.appeal),
          formAction: paths.appealSubmitted.helpWithFeesRefund,
          continueCancelButtons: true,
          refundJourney: true
        });
    });
  });

  describe('When Flag is switched off expectations', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(false);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postHelpWithFees()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await getHelpWithFees(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('getFeeSupport should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getHelpWithFees(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
