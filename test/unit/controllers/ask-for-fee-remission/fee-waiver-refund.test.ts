import express, { NextFunction, Request, Response } from 'express';
import {
  getFeeWaiver,
  postFeeWaiver,
  setupFeeWaiverRefundController
} from '../../../../app/controllers/ask-for-fee-remission/fee-waiver-refund';

import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

describe('Fee waiver Refund Controller', function () {
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
  describe('setupFeeWaiverController', () => {
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

      setupFeeWaiverRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.feeWaiverRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.feeWaiverRefund);
    });

    it('should render fee-waiver.njk', async () => {
      await getFeeWaiver(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/fee-waiver.njk', {
        previousPage: paths.appealSubmitted.feeSupportRefund,
        refundJourney: true
      });
    });

    it('should redirect task-list.njk', async () => {
      await postFeeWaiver()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
    });

    it('when in edit mode should redirect check-and-send.njk and reset isEdit flag', async () => {
      req.query = { 'edit': '' };
      await postFeeWaiver()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWithMatch(new RegExp(`${paths.appealSubmitted.checkYourAnswersRefund}(?!.*\\bedit\\b)`));
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('when called with edit param should render fee-waiver.njk and update session', async () => {
      req.query = { 'edit': '' };
      await getFeeWaiver(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/fee-waiver.njk');
    });

    it('should reset values from other journeys if it present', async () => {
      let application = req.session.appeal.application;
      application.lateRemissionOption = 'test value';
      application.lateAsylumSupportRefNumber = 'test value';
      application.lateHelpWithFeesOption = 'test value';
      application.lateHelpWithFeesRefNumber = 'test value';
      application.lateLocalAuthorityLetters = [];

      await postFeeWaiver()(req as Request, res as Response, next);
      expect(application.lateRemissionOption).to.be.eq('test value');
      expect(application.lateHelpWithFeesOption).to.be.null;
      expect(application.lateHelpWithFeesRefNumber).to.be.null;
      expect(application.lateLocalAuthorityLetters).to.be.null;
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
      await getFeeWaiver(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postFeeWaiver()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('getFeeWaiver should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getFeeWaiver(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
