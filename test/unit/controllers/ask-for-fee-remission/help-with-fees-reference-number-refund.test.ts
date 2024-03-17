import express, { NextFunction, Request, Response } from 'express';
import {
  getHelpWithFeesRefNumber,
  postHelpWithFeesRefNumber,
  setupHelpWithFeesReferenceNumberRefundController
} from '../../../../app/controllers/ask-for-fee-remission/help-with-fees-reference-number-refund';
import { FEATURE_FLAGS } from '../../../../app/data/constants';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import Logger from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Help with fees reference number refund Controller', function () {
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

  describe('setupHelpWithFeesReferenceNumberRefundController', () => {
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

      setupHelpWithFeesReferenceNumberRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.helpWithFeesReferenceNumberRefund);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealSubmitted.helpWithFeesReferenceNumberRefund);
    });

    it('should render appeal-application/fee-support/help-with-fees-reference-number.njk', async () => {
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      const helpWithFeesReferenceNumber = null;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/help-with-fees-reference-number.njk', {
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        formAction: paths.appealSubmitted.helpWithFeesReferenceNumberRefund,
        helpWithFeesReferenceNumber,
        refundJourney: true
      });
    });

    it('should validate and redirect to CYA page', async () => {
      req.body['helpWithFeesRefNumber'] = 'HWF-111';
      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateHelpWithFeesRefNumber).to.be.eql('HWF-111');
      expect(res.redirect).to.have.been.calledWith(paths.appealSubmitted.checkYourAnswersRefund);
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      req.body['helpWithFeesRefNumber'] = 'HWF-111';
      req.query = { 'edit': '' };
      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateHelpWithFeesRefNumber).to.be.eql('HWF-111');
      expect(res.redirect).to.have.been.calledWithMatch(new RegExp(`${paths.appealSubmitted.checkYourAnswersRefund}(?!.*\\bedit\\b)`));
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('when called with edit param should render fee-waiver.njk and update session', async () => {
      req.query = { 'edit': '' };
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/help-with-fees-reference-number.njk');
    });

    it('should fail validation if value is empty and render appeal-application/fee-support/help-with-fees-reference-number.njk with error', async () => {
      req.body['helpWithFeesRefNumber'] = '';

      const error = {
        key: 'helpWithFeesRefNumber',
        text: 'Enter your Help with Fees reference number',
        href: '#helpWithFeesRefNumber'
      };
      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/fee-support/help-with-fees-reference-number.njk',
        {
          errors: {
            helpWithFeesRefNumber: error
          },
          errorList: [error],
          previousPage: paths.appealSubmitted.helpWithFeesReferenceNumberRefund,
          pageTitle: i18n.pages.helpWithFeesReference.title,
          formAction: paths.appealSubmitted.helpWithFeesReferenceNumberRefund,
          refundJourney: true
        });
    });

    it('should fail validation if value doesnt match the regex and render appeal-application/fee-support/help-with-fees-reference-number.njk with error', async () => {
      req.body['helpWithFeesRefNumber'] = '123';

      const error = {
        key: 'helpWithFeesRefNumber',
        text: 'Your Help with Fees reference number must start with HWF, like HWF-A1B-23C',
        href: '#helpWithFeesRefNumber'
      };
      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/fee-support/help-with-fees-reference-number.njk',
        {
          errors: {
            helpWithFeesRefNumber: error
          },
          errorList: [error],
          previousPage: paths.appealSubmitted.helpWithFeesReferenceNumberRefund,
          pageTitle: i18n.pages.helpWithFeesReference.title,
          formAction: paths.appealSubmitted.helpWithFeesReferenceNumberRefund,
          refundJourney: true
        });
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should reset values from other journeys if it present', async () => {
      req.body = {
        'helpWithFeesRefNumber': 'HWF-1324'
      };

      let application = req.session.appeal.application;
      application.lateAsylumSupportRefNumber = 'test value';
      application.lateLocalAuthorityLetters = [];

      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(application.lateAsylumSupportRefNumber).to.be.null;
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
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      await postHelpWithFeesRefNumber()(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('Exception when error thrown', () => {
    it('getHelpWithFeesRefNumber should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
