const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getEnterPostcodePage, postEnterPostcodePage, setupPersonalDetailsController } from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Home Office Details Controller', function() {
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
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.enterPostcode);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.enterPostcode);
    });
  });

  describe('getEnterPostcodePage', () => {
    it('should render appeal-application/enter-postcode.njk', function () {
      getEnterPostcodePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/enter-postcode.njk');
    });
  });

  describe('postEnterPostcodePage', () => {
    it('should validate and render appeal-application/enter-postcode.njk', () => {
      req.body.postcode = 'W1W 7RT';
      postEnterPostcodePage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/enter-postcode.njk');
    });
  });

  describe('Should catch an error.', function () {
    it('getEnterPostcodePage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getEnterPostcodePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/enter-postcode.njk with error', () => {
      req.body.postcode = 'invalid';
      const postcode = { href: '#postcode', key: 'postcode', text: 'Enter a valid postcode' };
      const invalidPostcodeText = [
        {
          key: 'postcode',
          text: 'Enter a valid postcode',
          href: '#postcode'
        }
      ];
      postEnterPostcodePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/enter-postcode.njk',
        {
          error: { postcode },
          errorList: invalidPostcodeText
        });
    });

    it('should fail validation and render appeal-application/enter-postcode.njk with error', () => {
      req.body.postcode = '';
      const postcode = { href: '#postcode', key: 'postcode', text: 'Enter your postcode' };
      const emptyPostcodeText = [
        {
          key: 'postcode',
          text: 'Enter your postcode',
          href: '#postcode'
        }
      ];

      postEnterPostcodePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
          'appeal-application/enter-postcode.njk',
        {
          error: { postcode },
          errorList: emptyPostcodeText
        });
    });
  });
});
