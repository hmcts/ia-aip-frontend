import express, { NextFunction, Request, Response } from 'express';
import {
  getAsylumSupport,
  postAsylumSupport,
  setupAsylumSupportController
} from '../../../app/controllers/appeal-application/asylum-support';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Asylum support Controller', function () {
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

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: sandbox.stub().returns({
        case_data: {
          asylumSupportRefNumber: 'A1234567'
        }
      })
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupAsylumSupportController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupAsylumSupportController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.asylumSupport);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.asylumSupport);
    });
  });

  describe('getAsylumSupport', () => {
    it('should render appeal-application/fee-support/asylum-support.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await getAsylumSupport(req as Request, res as Response, next);
      const asylumSupportRefNumber = null;
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/asylum-support.njk', {
        previousPage: paths.appealStarted.feeSupport,
        formAction: paths.appealStarted.asylumSupport,
        asylumSupportRefNumber,
        saveAndContinue: true
      });
    });

    it('getAsylumSupport should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getAsylumSupport(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getAsylumSupport(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('postAsylumSupport', () => {
    it('should validate and redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          asylumSupportRefNumber: '12345',
          feeSupportPersisted: true,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          asylumSupportRefNumber: '12345'
        }
      } as Appeal);
      req.body['asylumSupportRefNumber'] = '12345';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.asylumSupportRefNumber).to.be.eql('12345');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('when save for later should validate and redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          asylumSupportRefNumber: '12345',
          feeSupportPersisted: true,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          asylumSupportRefNumber: 'A1234567'
        }
      } as Appeal);
      req.body['asylumSupportRefNumber'] = '12345';
      req.body['saveForLater'] = 'saveForLater';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.asylumSupportRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          asylumSupportRefNumber: '1212-0099-0089-1080',
          isEdit: true,
          isAppealLate: false,
          feeSupportPersisted: true,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          asylumSupportRefNumber: '1212-0099-0089-1080'
        }
      } as Appeal);
      req.session.appeal.application.isEdit = true;
      req.body['asylumSupportRefNumber'] = '1212-0099-0089-1080';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.asylumSupportRefNumber).to.be.eql('1212-0099-0089-1080');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('should fail validation and render appeal-application/fee-support/asylum-support.njk with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body['asylumSupportRefNumber'] = '';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        key: 'asylumSupportRefNumber',
        text: 'Enter your asylum support reference number',
        href: '#asylumSupportRefNumber'
      };
      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/fee-support/asylum-support.njk',
        {
          errors: {
            asylumSupportRefNumber: error
          },
          errorList: [error],
          previousPage: paths.appealStarted.feeSupport,
          pageTitle: i18n.pages.asylumSupportPage.title,
          formAction: paths.appealStarted.asylumSupport,
          saveAndContinue: true
        });
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body = {
        'asylumSupportRefNumber': '',
        'saveForLater': 'saveForLater'
      };

      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should reset values from other journeys if it present', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body = {
        'asylumSupportRefNumber': '',
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
          asylumSupportRefNumber: '12345',
          feeSupportPersisted: true,
          helpWithFeesOption: null,
          helpWithFeesRefNumber: null,
          localAuthorityLetters: null
        }
      };

      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          asylumSupportRefNumber: '12345'
        }
      } as Appeal);
      req.body['asylumSupportRefNumber'] = '12345';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
    });
  });
});
