import express, { NextFunction, Request, Response } from 'express';
import {
  getHelpWithFeesRefNumber,
  postHelpWithFeesRefNumber,
  setupHelpWithFeesReferenceNumberController
} from '../../../app/controllers/appeal-application/help-with-fees-reference-number';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Help with fees reference number Controller', function () {
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
          helpWithFeesRefNumber: 'HWF12345'
        }
      })
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHelpWithFeesReferenceNumberController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupHelpWithFeesReferenceNumberController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.helpWithFeesReferenceNumber);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.helpWithFeesReferenceNumber);
    });
  });

  describe('getHelpWithFeesRefNumber', () => {
    it('should render appeal-application/fee-support/help-with-fees-reference-number.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/fee-support/help-with-fees-reference-number.njk', {
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        formAction: paths.appealStarted.helpWithFeesReferenceNumber,
        helpWithFeesReferenceNumber: null,
        saveAndContinue: true
      });
    });

    it('getHelpWithFeesRefNumber should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').throws(error);
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });
  });

  describe('postHelpWithFeesRefNumber', () => {
    it('should validate and redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          helpWithFeesRefNumber: 'HWF12345',
          feeSupportPersisted: true
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.helpWithFeesRefNumber).to.be.eql('HWF12345');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('when save for later should validate and redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          helpWithFeesRefNumber: 'HWF12345',
          feeSupportPersisted: true
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      req.body['saveForLater'] = 'saveForLater';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.helpWithFeesRefNumber).to.be.eql('HWF12345');
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isEdit: true,
          helpWithFeesRefNumber: 'HWF12345',
          feeSupportPersisted: true
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.session.appeal.application.isEdit = true;
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.helpWithFeesRefNumber).to.be.eql('HWF12345');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });

    it('should fail validation if value is empty and render appeal-application/fee-support/help-with-fees-reference-number.njk with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body['helpWithFeesRefNumber'] = '';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        key: 'helpWithFeesRefNumber',
        text: 'Enter your Help with Fees reference number',
        href: '#helpWithFeesRefNumber'
      };
      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/fee-support/help-with-fees-reference-number.njk',
        {
          errors: {
            helpWithFeesRefNumber: error
          },
          errorList: [error],
          previousPage: paths.appealStarted.helpWithFeesReferenceNumber,
          pageTitle: i18n.pages.helpWithFeesReference.title,
          formAction: paths.appealStarted.helpWithFeesReferenceNumber,
          saveAndContinue: true
        });
    });

    it('should fail validation if value doesnt match the regex and render appeal-application/fee-support/help-with-fees-reference-number.njk with error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body['helpWithFeesRefNumber'] = '123';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        key: 'helpWithFeesRefNumber',
        text: 'Your Help with Fees reference number must start with HWF, like HWF-A1B-23C',
        href: '#helpWithFeesRefNumber'
      };
      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/fee-support/help-with-fees-reference-number.njk',
        {
          errors: {
            helpWithFeesRefNumber: error
          },
          errorList: [error],
          previousPage: paths.appealStarted.helpWithFeesReferenceNumber,
          pageTitle: i18n.pages.helpWithFeesReference.title,
          formAction: paths.appealStarted.helpWithFeesReferenceNumber,
          saveAndContinue: true
        });
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      req.body = {
        'helpWithFeesRefNumber': '',
        'saveForLater': 'saveForLater'
      };

      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.common.overview);
    });

    it('should reset values from other journeys if it present', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      req.body = {
        'saveForLater': 'saveForLater',
        'asylumSupportRefNumber': 'test helpWithFeesOption',
        'localAuthorityLetters': 'test helpWithFeesRefNumber'
      };

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          helpWithFeesRefNumber: 'HWF12345',
          feeSupportPersisted: true
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
    });
  });
});
