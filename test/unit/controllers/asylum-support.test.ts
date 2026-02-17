import express, { Request, Response } from 'express';
import session from 'express-session';
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
  let redirectStub: sinon.SinonSpy;
  let renderStub: sinon.SinonStub;
  let submit: sinon.SinonStub;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    redirectStub = sandbox.spy();
    renderStub = sandbox.stub();
    submit = sandbox.stub().returns({
      case_data: {
        asylumSupportRefNumber: 'A1234567'
      }
    });
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        } as Appeal
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

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: submit
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
      expect(routerGetStub.calledWith(paths.appealStarted.asylumSupport)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.asylumSupport)).to.equal(true);
    });
  });

  describe('getAsylumSupport', () => {
    it('should render appeal-application/fee-support/asylum-support.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await getAsylumSupport(req as Request, res as Response, next);
      const asylumSupportRefNumber = null;
      expect(renderStub).to.be.calledOnceWith('appeal-application/fee-support/asylum-support.njk', {
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
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getAsylumSupport(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          asylumSupportRefNumber: '12345'
        }
      } as Appeal);
      req.body['asylumSupportRefNumber'] = '12345';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.asylumSupportRefNumber).to.deep.equal('12345');
      expect(redirectStub.calledWith(paths.appealStarted.taskList)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          asylumSupportRefNumber: 'A1234567'
        }
      } as Appeal);
      req.body['asylumSupportRefNumber'] = '12345';
      req.body['saveForLater'] = 'saveForLater';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.asylumSupportRefNumber).to.deep.equal('A1234567');
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
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
      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          asylumSupportRefNumber: '1212-0099-0089-1080'
        }
      } as Appeal);
      req.session.appeal.application.isEdit = true;
      req.body['asylumSupportRefNumber'] = '1212-0099-0089-1080';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.asylumSupportRefNumber).to.deep.equal('1212-0099-0089-1080');
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
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
      expect(submit.called).to.equal(false);
      expect(renderStub).to.be.calledWith(
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

      expect(submit.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
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

      updateAppealService.submitEventRefactored = submit.returns({
        application: {
          asylumSupportRefNumber: '12345'
        }
      } as Appeal);
      req.body['asylumSupportRefNumber'] = '12345';
      await postAsylumSupport(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submit.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
    });
  });
});
