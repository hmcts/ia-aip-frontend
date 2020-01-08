const express = require('express');
import { NextFunction, Request, Response, text } from 'express';
import { getReasonForAppeal, postReasonForAppeal, setupReasonsForAppealController } from '../../../app/controllers/reason-for-appeal';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Reasons for Appeal Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: null
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>,
      body: {},
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      redirect: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupReasonsForAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupReasonsForAppealController({ updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.reasonsForAppeal.decision);
      expect(routerPOSTStub).to.have.been.calledWith(paths.reasonsForAppeal.decision);
    });
  });

  describe('getReasonForAppeal', () => {
    it('should render case-building/reasons-for-appeal/reason-for-appeal.njk', function () {
      getReasonForAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('case-building/reasons-for-appeal/reason-for-appeal.njk', {
        previousPage:  '/appellant-timeline'
      });
    });
  });

  describe('Should catch an error.', function () {
    it('getReasonForAppeal should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getReasonForAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render case-building/reasons-for-appeal/reason-for-appeal.njk with error', async () => {
      req.body.moreDetail = '';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      const moreDetailError = {
        text: 'Enter the reasons you think the Home Office decision is wrong',
        href: '#moreDetail',
        key: 'moreDetail'
      };
      const error = {
        moreDetail: moreDetailError
      };
      const errorList = [ moreDetailError ];

      expect(res.render).to.have.been.calledWith(
        'case-building/reasons-for-appeal/reason-for-appeal.njk',
        {
          error,
          errorList,
          previousPage: '/appellant-timeline'
        }
      );
    });

    it('should pass validation and render case-building/reasons-for-appeal/reason-for-appeal.njk without error', async () => {
      req.body.moreDetail = 'Text Word';
      await postReasonForAppeal(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(
          'case-building/reasons-for-appeal/check-and-send.njk');
    });
  });
});
