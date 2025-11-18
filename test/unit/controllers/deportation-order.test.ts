import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  getDeportationOrder, getDeportationOrderOptionsQuestion,
  postDeportationOrder,
  setupDeportationOrderController
} from '../../../app/controllers/appeal-application/deportation-order';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Deportation order Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: sinon.SinonStub;
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
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub();

    updateAppealService = {
      submitEvent: sandbox.stub(),
      submitEventRefactored: sandbox.stub().returns({
        case_data: {
          asylumSupportRefNumber: 'A1234567'
        }
      })
    };

    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_INTERNAL_FEATURE_FLAG, false).resolves(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDeportationOrderController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware = [];

      setupDeportationOrderController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.deportationOrder);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.deportationOrder);
    });
  });

  describe('getDeportationOrder', () => {
    it('should render templates/deportation-order.njk', async () => {
      await getDeportationOrder(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/deportation-order.njk', {
        previousPage: paths.appealStarted.homeOfficeDecisionLetter,
        formAction: paths.appealStarted.deportationOrder,
        question: sinon.match.any
      });
    });

    it('getDeportationOrder should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getDeportationOrder(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDeportationOrder', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body['answer'] = 'Yes';
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          deportationOrderOptions: 'Yes'
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          deportationOrderOptions: 'Yes'
        }
      } as Appeal);

    });

    it('should validate and redirect CYA page', async () => {
      await postDeportationOrder(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(req.session.appeal.application.deportationOrderOptions).to.be.eql('Yes');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      await postDeportationOrder(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWithMatch(new RegExp(`${paths.appealStarted.checkAndSend}(?!.*\\bedit\\b)`));
      expect(req.session.appeal.application.isEdit).to.be.undefined;
    });
  });

  it('should fail validation and render with error', async () => {
    const error = {
      key: 'answer',
      text: 'Select yes if a deportation order has been made',
      href: '#answer'
    };

    await postDeportationOrder(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    const deportationOptions = getDeportationOrderOptionsQuestion(req.session.appeal);
    expect(res.render).to.have.been.calledWith(
      'templates/deportation-order.njk',
      {
        errors: {
          answer: error
        },
        errorList: [error],
        previousPage: paths.appealStarted.homeOfficeDecisionLetter,
        formAction: paths.appealStarted.deportationOrder,
        question: deportationOptions
      });
  });

  it('should catch exception and call next with the error', async () => {

    const error = new Error('an error');
    res.render = sandbox.stub().throws(error);
    await postDeportationOrder(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
