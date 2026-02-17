import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
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
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  let submitStub: sinon.SinonStub;
  let submitRefactoredStub: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
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
    submitRefactoredStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();

    updateAppealService = {
      submitEvent: submitStub,
      submitEventRefactored: submitRefactoredStub.returns({
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
      expect(routerGetStub.calledWith(paths.appealStarted.helpWithFeesReferenceNumber)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.helpWithFeesReferenceNumber)).to.equal(true);
    });
  });

  describe('getHelpWithFeesRefNumber', () => {
    it('should render appeal-application/fee-support/help-with-fees-reference-number.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/fee-support/help-with-fees-reference-number.njk', {
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
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await getHelpWithFeesRefNumber(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
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
          feeSupportPersisted: true,
          asylumSupportRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.helpWithFeesRefNumber).to.deep.equal('HWF12345');
      expect(redirectStub.calledWith(paths.appealStarted.taskList)).to.equal(true);
    });

    it('when save for later should validate and redirect task-list.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isAppealLate: false,
          helpWithFeesRefNumber: 'HWF12345',
          feeSupportPersisted: true,
          asylumSupportRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      req.body['saveForLater'] = 'saveForLater';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.helpWithFeesRefNumber).to.deep.equal('HWF12345');
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          isEdit: true,
          helpWithFeesRefNumber: 'HWF12345',
          feeSupportPersisted: true,
          asylumSupportRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.session.appeal.application.isEdit = true;
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.helpWithFeesRefNumber).to.deep.equal('HWF12345');
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
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
      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledWith(
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
      expect(submitRefactoredStub.called).to.equal(false);
      expect(renderStub).to.be.calledWith(
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

      expect(submitRefactoredStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

      const error = new Error('an error');
      res.render = renderStub.throws(error);
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('should redirect to overview page when feature flag OFF', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(false);
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.common.overview)).to.equal(true);
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
          feeSupportPersisted: true,
          asylumSupportRefNumber: null,
          localAuthorityLetters: null
        }
      };
      updateAppealService.submitEventRefactored = submitRefactoredStub.returns({
        application: {
          helpWithFeesRefNumber: 'HWF12345'
        }
      } as Appeal);
      req.body['helpWithFeesRefNumber'] = 'HWF12345';
      await postHelpWithFeesRefNumber(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(submitRefactoredStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
    });
  });
});
