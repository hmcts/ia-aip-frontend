const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getManualEnterAddressPage,
  postManualEnterAddressPage,
  setupPersonalDetailsController
} from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Personal Details Controller', function () {
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
      cookies: {},
      idam: {
        userDetails: {}
      },
      session: {
        appeal: {
          application: {}
        } as Appeal
      } as Partial<Express.Session>,
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { updateAppeal: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupPersonalDetailsController({ updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.enterAddress);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.enterAddress);
    });
  });

  describe('getManualEnterAddressPage', () => {
    it('should redirect to enter postcode page if postcode not present', () => {
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.personalDetails.enterPostcode);
    });

    it('should render appeal-application/personal-details/enter-address.njk', function () {
      req.session.appeal.application.contactDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      };
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk');
    });

    it('should catch an exception and call next()', () => {
      req.session.appeal.application.contactDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      };
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postManualEnterAddress', () => {
    it('should fail validation and render appeal-application/personal-details/enter-address.njk', () => {
      req.session.appeal.application.contactDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      };
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W';

      postManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/enter-address.njk');
    });

    it('should validate and redirect to task list page', () => {
      req.session.appeal.application.contactDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      };
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W1W 7RT';

      postManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should catch an exception and call next()', () => {
      req.session.appeal.application.contactDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      };
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      postManualEnterAddressPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
