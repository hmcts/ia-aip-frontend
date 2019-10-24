const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getNationalityPage, postNationalityPage, setupPersonalDetailsController } from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { nationalities } from '../../../app/utils/nationalities';
import { expect, sinon } from '../../utils/testUtils';

describe('Nationalities Controller', function() {
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

  describe(' setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupPersonalDetailsController();
      expect(routerGetStub).to.have.been.calledWith(paths.nationality);
      expect(routerPOSTStub).to.have.been.calledWith(paths.nationality);
    });
  });

  describe('getNationalityPage', () => {
    it('should render appeal-application/nationality.njk', function () {
      getNationalityPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/nationality.njk');
    });
  });

  describe('postNationality', () => {
    it('should validate and render appeal-application/nationality.njk', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = 'stateless';
      req.body.nationality = '';

      expect(res.render).to.have.been.calledWith('appeal-application/nationality.njk');
    });

    it('should validate and render appeal-application/nationality.njk', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = '';
      req.body.nationality = 'British';

      expect(res.render).to.have.been.calledWith('appeal-application/nationality.njk');
    });
  });

  describe('Should catch an error.', function () {
    it('getNationalityPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNationalityPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/nationality.njk with error', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = '';
      req.body.nationality = '';
      expect(res.render).to.have.been.calledWith('appeal-application/nationality.njk',
        {
          errors: { errorList: [{ href: '#', text: 'Please select a nationality.' }] },
          nationalities: nationalities
        });
    });

    it('should fail validation and render appeal-application/nationality.njk with error', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = 'stateless';
      req.body.nationality = 'British';
      expect(res.render).to.have.been.calledWith('appeal-application/nationality.njk',
        {
          errors: { errorList: [{ href: '#', text: 'Please select a nationality.' }] },
          nationalities: nationalities
        });
    });
  });
});
