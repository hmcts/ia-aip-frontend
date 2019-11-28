import { Address, Point } from '@hmcts/os-places-client';

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

    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
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
    it('should render appeal-application/personal-details/enter-address.njk', function () {
      // @ts-ignore
      req.session.appeal.application.addressLookup = {
        selected: 'udprn',
        result: {
          addresses: [
            new Address('123', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn')
          ]
        }
      };
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk', {
        address: {
          line1: 'subBuildingName buildingName',
          line2: '2 dependentThoroughfareName, thoroughfareName, doubleDependentLocality, dependentLocality',
          city: 'postTown',
          county: '',
          postcode: 'postcode'
        }
      });
    });

    it('should catch an exception and call next()', () => {
      // @ts-ignore
      req.session.appeal.application.addressLookup = {
        selected: 'udprn',
        result: {
          addresses: [
            new Address('123', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn')
          ]
        }
      };
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postManualEnterAddress', () => {
    it('should fail validation and render appeal-application/personal-details/enter-address.njk', async () => {
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W';

      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/enter-address.njk');
    });

    it('should validate and redirect to task list page', async () => {
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W1W 7RT';

      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
