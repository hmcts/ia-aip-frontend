const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getEnterPostcodePage, postEnterPostcodePage, setupPersonalDetailsController } from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Personal Details Controller', function() {
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
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.enterPostcode);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.enterPostcode);
    });
  });

  describe('getEnterPostcodePage', () => {
    it('should render appeal-application/personal-details/enter-postcode.njk', function () {
      getEnterPostcodePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-postcode.njk');
    });
  });

  describe('postEnterPostcodePage', () => {
    it('should validate and render appeal-application/personal-details/enter-postcode.njk', () => {
      req.body.postcode = 'W1W 7RT';
      postEnterPostcodePage(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });
  });

  describe('Should catch an error.', function () {
    it('getEnterPostcodePage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getEnterPostcodePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/personal-details/enter-postcode.njk with error', () => {
      req.body.postcode = 'invalid';
      const error = {
        key: 'postcode',
        text: 'Enter a real postcode',
        href: '#postcode'
      };
      postEnterPostcodePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/enter-postcode.njk',
        {
          error: { postcode: error },
          errorList: [ error ],
          postcode: 'invalid'
        });
    });

    it('should fail validation and render appeal-application/personal-details/enter-postcode.njk with error 2', () => {
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
        'appeal-application/personal-details/enter-postcode.njk',
        {
          error: { postcode },
          errorList: emptyPostcodeText,
          postcode: ''
        });
    });
  });
});
