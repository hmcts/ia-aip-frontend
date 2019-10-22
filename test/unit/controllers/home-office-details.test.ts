const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getHomeOfficeDetails, postHomeOfficeDetails, setupHomeOfficeDetailsController } from '../../../app/controllers/home-office-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
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
      session: {
        appealApplication: {}
      } as any,
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
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHomeOfficeDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupHomeOfficeDetailsController();
      expect(routerGetStub).to.have.been.calledWith(paths.homeOfficeDetails);
      expect(routerPOSTStub).to.have.been.calledWith(paths.homeOfficeDetails);
    });
  });

  describe('getHomeOfficeDetails', () => {
    it('should render home-office-details.njk', function() {
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office-details.njk');
    });

    it('should catch exception and call next with the error', function() {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHomeOfficeDetails', () => {
    it('should validate and render home-office-details.njk', () => {
      req.body['homeOfficeRefNumber'] = 'A1234567';
      postHomeOfficeDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office-details.njk',
        {
          error: null,
          application: {
            homeOfficeReference: 'A1234567'
          }
        });
    });

    it('should fail validation and render home-office-details.njk with error', () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      postHomeOfficeDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office-details.njk',
        {
          error: i18n.fieldsValidations.homeOfficeRef,
          application: {}
        });
    });

    it('should catch exception and call next with the error', function() {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      postHomeOfficeDetails(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
