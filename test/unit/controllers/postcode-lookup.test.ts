const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getPostcodeLookupPage,
  postPostcodeLookupPage,
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
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.postcodeLookup);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.postcodeLookup);
    });
  });

  describe('getPostcodeLookupPage', () => {
    it('should render appeal-application/personal-details/postcode-lookup.njk', function () {
      getPostcodeLookupPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/postcode-lookup.njk');
    });
  });

  describe('Should catch an error.', function () {
    it('getPostcodeLookupPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getPostcodeLookupPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/personal-details/postcode-lookup.njk with error', () => {
      req.body.address = '';

      postPostcodeLookupPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/postcode-lookup.njk',
        {
          addresses: [
            { text: 'Select', value: '' },
            { text: '60 GPS London United Kingdom  W1W 7RT', value: '60 GPS London United Kingdom  W1W 7RT' }
          ],
          error: { address: { href: '#address', key: 'address', text: 'Select a address' } },
          errorList: [{
            key: 'address',
            text: 'Select a address',
            href: '#address'
          }]

        });
    });
  });
});
