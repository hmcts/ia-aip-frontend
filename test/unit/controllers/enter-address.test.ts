const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getManualEnterAddressPage,
  postManualEnterAddressPage,
  setupPersonalDetailsController
} from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Personal Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
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
      session: {},
      app: {
        locals: {
          logger
        }
      } as any
    } as unknown as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupPersonalDetailsController();
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.enterAddress);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.enterAddress);
    });
  });

  describe('getManualEnterAddressPage', () => {
    it('should render appeal-application/personal-details/enter-address.njk', function () {
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk');
    });
  });

  describe('postManualEnterAddress', () => {
    it('should validate and render appeal-application/personal-details/enter-address.njk', () => {
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W1W 7RT';
      req.session.personalDetails = {
        address: {}
      };
      postManualEnterAddressPage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/enter-address.njk');
    });
  });

  describe('Should catch an error.', function () {
    it('getManualEnterAddressPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/personal-details/enter-address.njk with error', () => {
      req.body['address-line-1'] = '';
      req.body['address-town'] = '';
      req.body['address-county'] = '';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = '';
      postManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/enter-address.njk',
        {
          error: {
            'address-county': { href: '#address-county', key: 'address-county', text: 'Enter a County.' },
            'address-line-1': {
              href: '#address-line-1',
              key: 'address-line-1',
              text: 'Enter a building number and street name.'
            },
            'address-town': { href: '#address-town', key: 'address-town', text: 'Enter Town or City.' }
          },
          errorList: [
            {
              key: 'address-line-1',
              text: 'Enter a building number and street name.',
              href: '#address-line-1'
            },
            {
              key: 'address-town',
              text: 'Enter Town or City.',
              href: '#address-town'
            },
            {
              key: 'address-county',
              text: 'Enter a County.',
              href: '#address-county'
            }
          ]
        });
    });
  });
});
