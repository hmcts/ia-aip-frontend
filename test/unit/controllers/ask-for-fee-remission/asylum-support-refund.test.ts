import express, { NextFunction, Request, Response } from 'express';
import {
  getAsylumSupport,
  postAsylumSupport,
  setupAsylumSupportRefundController
} from '../../../../app/controllers/ask-for-fee-remission/asylum-support-refund';
import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import Logger from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Asylum support refund Controller', function () {
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
        } as Appeal
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

  describe('setupAsylumSupportRefundController', () => {
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

      setupAsylumSupportRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.asylumSupportRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.asylumSupportRefund);
    });

    it('should render appeal-application/fee-support/asylum-support.njk', async () => {
      await getAsylumSupport(req as Request, res as Response, next);
      const asylumSupportRefNumber = null;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/asylum-support.njk', {
        previousPage: paths.appealSubmitted.feeSupportRefund,
        formAction: paths.appealSubmitted.asylumSupportRefund,
        asylumSupportRefNumber,
        refundJourney: true
      });
    });

    it('should validate and redirect task-list.njk', async () => {
      req.body['asylumSupportRefNumber'] = '12345';
      await postAsylumSupport()(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAsylumSupportRefNumber).to.be.eql('12345');
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      req.body['asylumSupportRefNumber'] = '12345';
      await postAsylumSupport()(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAsylumSupportRefNumber).to.be.eql('12345');
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('should fail validation and render appeal-application/fee-support/asylum-support.njk with error', async () => {
      req.body['asylumSupportRefNumber'] = '';

      const error = {
        key: 'asylumSupportRefNumber',
        text: 'Enter your asylum support reference number',
        href: '#asylumSupportRefNumber'
      };
      await postAsylumSupport()(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/fee-support/asylum-support.njk',
        {
          errors: {
            asylumSupportRefNumber: error
          },
          errorList: [error],
          previousPage: paths.appealSubmitted.asylumSupportRefund,
          pageTitle: i18n.pages.asylumSupportPage.title,
          formAction: paths.appealSubmitted.asylumSupportRefund,
          refundJourney: true
        });
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postAsylumSupport()(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should reset values from other journeys if it present', async () => {
      req.body = {
        'asylumSupportRefNumber': '1324'
      };

      let application = req.session.appeal.application;
      application.lateHelpWithFeesOption = 'test value';
      application.lateHelpWithFeesRefNumber = 'test value';
      application.lateLocalAuthorityLetters = [];

      await postAsylumSupport()(req as Request, res as Response, next);
      expect(application.lateHelpWithFeesOption).to.be.null;
      expect(application.lateHelpWithFeesRefNumber).to.be.null;
      expect(application.lateLocalAuthorityLetters).to.be.null;
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
      await getAsylumSupport(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postAsylumSupport()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('getAsylumSupport should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getAsylumSupport(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
