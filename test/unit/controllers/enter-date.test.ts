const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getDateOfBirthPage, postDateOfBirth, setupPersonalDetailsController } from '../../../app/controllers/personal-details';
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

  describe('setupDateOfBirthController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupPersonalDetailsController();
      expect(routerGetStub).to.have.been.calledWith(paths.DOB);
      expect(routerPOSTStub).to.have.been.calledWith(paths.DOB);
    });
  });

  describe('getDateOfBirthPage', () => {
    it('should render appeal-application/date-of-birth.njk', function () {
      getDateOfBirthPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/date-of-birth.njk');
    });
  });

  describe('postDateOfBirth', () => {
    it('should validate and render appeal-application/date-of-birth.njk', () => {
      postDateOfBirth(req as Request, res as Response, next);
      req.body.day = 1;
      req.body.month = 19;
      req.body.year = 1993;

      expect(res.render).to.have.been.calledWith('appeal-application/date-of-birth.njk');
    });
  });

  describe('Should catch an error.', function () {
    it('getDateOfBirthPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getDateOfBirthPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/date-of-birth.njk with error', () => {
      postDateOfBirth(req as Request, res as Response, next);
      req.body.day = 0;
      req.body.month = 0;
      req.body.year = 0;

      expect(res.render).to.have.been.calledWith(
                'appeal-application/date-of-birth.njk',
        {
          errors: {
            errorList: [{ href: '#', text: '"day" is required' }, { href: '#', text: '"month" is required' }, { href: '#', text: '"year" is required' }],
            fieldErrors: {
              day: { text: '"day" is required' },
              month: { text: '"month" is required' },
              year: { text: '"year" is required' }
            }
          }
        });
    });
  });
});
