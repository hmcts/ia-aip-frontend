import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  getFeeWaiver,
  postFeeWaiver,
  setupFeeWaiverController
} from '../../../app/controllers/appeal-application/fee-waiver';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Fee waiver Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
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
          application: {
            isAppealLate: false
          }
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

    next = sandbox.stub();

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: submitStub.returns({
        case_data: {
          asylumSupportRefNumber: 'A1234567'
        }
      })
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupFeeWaiverController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupFeeWaiverController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.appealStarted.feeWaiver)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.feeWaiver)).to.equal(true);
    });
  });

  describe('getFeeWaiver', () => {
    it('should render fee-waiver.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await getFeeWaiver(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/fee-support/fee-waiver.njk', {
        previousPage: paths.appealStarted.feeSupport,
        saveAndContinue: true
      });
    });

    it('getFeeWaiver should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getFeeWaiver(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getFeeWaiver(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
    });
  });

  describe('postFeeWaiver', () => {
    let appeal: Appeal;
    beforeEach(() => {
      appeal = {
        ...req.session.appeal,
        paAppealTypeAipPaymentOption: '',
        application: {
          ...req.session.appeal.application,
          appealType: 'human-rights'
        }
      };

      updateAppealService.submitEventRefactored = submitStub.returns({
        application: {
          appealType: 'human-rights'
        }
      } as Appeal);
    });

    it('should redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          feeSupportPersisted: true,
          asylumSupportRefNumber: null,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };

      await postFeeWaiver(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('when save for later should redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          feeSupportPersisted: true,
          asylumSupportRefNumber: null,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };

      req.body['asylumSupportRefNumber'] = '12345';
      req.body['saveForLater'] = 'saveForLater';
      await postFeeWaiver(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('when in edit mode should redirect check-and-send.njk and reset isEdit flag', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.session.appeal.application.isEdit = true;

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          isEdit: true,
          asylumSupportRefNumber: null,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null,
          feeSupportPersisted: true
        }
      };

      await postFeeWaiver(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      const error = new Error('an error');
      res.redirect = redirectStub.throws(error);
      await postFeeWaiver(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postFeeWaiver(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
    });

    it('should reset values from other journeys if it present', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body = {
        'asylumSupportRefNumber': 'test asylumSupportRefNumber',
        'saveForLater': 'saveForLater',
        'helpWithFeesOption': 'test helpWithFeesOption',
        'helpWithFeesRefNumber': 'test helpWithFeesRefNumber',
        'localAuthorityLetter': 'test localAuthorityLetter'
      };

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          asylumSupportRefNumber: null,
          feeSupportPersisted: true,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };

      await postFeeWaiver(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
    });
  });
});
