import express, { NextFunction, Request, Response } from 'express';
import {
  getStepsToHelpWithFees,
  postStepsToHelpWithFees,
  setupStepToHelpWithFeesRefundController
} from '../../../../app/controllers/ask-for-fee-remission/steps-to-help-with-fees-refund';

import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

describe('Steps to help with fees Refund Controller', function () {
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
          application: {
            isAppealLate: false
          }
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
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('setupStepToHelpWithFeesRefundController', () => {
    beforeEach(() => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
        .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(true);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupStepToHelpWithFeesRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.stepsToApplyForHelpWithFeesRefund);
    });

    it('should render steps-to-help-with-fees.njk', async () => {
      await getStepsToHelpWithFees(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/steps-to-help-with-fees.njk', {
        previousPage: paths.appealSubmitted.helpWithFeesRefund,
        refundJourney: true
      });
    });

    it('should redirect help-with-fees-ref-number.njk', async () => {
      await postStepsToHelpWithFees()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.helpWithFeesReferenceNumberRefund);
    });

    it('when in edit mode should redirect check-and-send.njk and reset isEdit flag', async () => {
      req.query = { 'edit': '' };
      await postStepsToHelpWithFees()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWithMatch(new RegExp(`${paths.appealSubmitted.helpWithFeesReferenceNumberRefund}(?!.*\\bedit\\b)`));
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('when called with edit param should render fee-waiver.njk and update session', async () => {
      req.query = { 'edit': '' };
      await getStepsToHelpWithFees(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/steps-to-help-with-fees.njk');
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
      await getStepsToHelpWithFees(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postStepsToHelpWithFees()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('getFeeWaiver should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getStepsToHelpWithFees(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
