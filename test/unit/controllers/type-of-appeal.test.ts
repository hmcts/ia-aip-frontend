import { NextFunction, Request, Response } from 'express';
import {
  getTypeOfAppeal,
  postTypeOfAppeal,
  setupTypeOfAppealController
} from '../../../app/controllers/type-of-appeal';
import { appealTypes } from '../../../app/data/appeal-types';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Type of appeal Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {}
        }
      } as Partial<Express.Session>,
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
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupTypeOfAppealController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupTypeOfAppealController();
      expect(routerGetStub).to.have.been.calledWith(paths.typeOfAppeal);
      expect(routerPOSTStub).to.have.been.calledWith(paths.typeOfAppeal);
    });
  });

  describe('getTypeOfAppeal', () => {
    it('should render type-of-appeal.njk', () => {
      getTypeOfAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', { types: appealTypes });
    });

    it('getTypeOfAppeal should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getTypeOfAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postTypeOfAppeal', () => {
    it('should fail validation and render type-of-appeal.njk with a validation error', () => {
      req.body = { 'button': 'save-and-continue', 'appealType': '' };
      const expectedError: ValidationError = {
        href: '#undefined',
        key: undefined,
        text: 'You must select at least one option'
      };

      postTypeOfAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', {
        types: appealTypes,
        errors: { undefined: expectedError },
        errorList: [ expectedError ]
      });
    });

    it('should validate and redirect to the task-list page', () => {
      req.body = { 'button': 'save-and-continue', 'appealType': 'human-rights' };

      postTypeOfAppeal(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith('/task-list');
    });

    it('postTypeOfAppeal when clicked on save-and-continue with multiple selections should redirect to the next page', () => {
      req.body = { 'button': 'save-and-continue', 'appealType': [ 'human-rights', 'eea', 'protection' ] };

      postTypeOfAppeal(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith('/task-list');
    });

    it('postTypeOfAppeal should catch exception and call next with the error', () => {
      const error = new Error('an error');
      req.body = { 'button': 'save-for-later', 'appealType': [ 'human-rights', 'eea', 'protection' ] };
      res.redirect = sandbox.stub().throws(error);
      postTypeOfAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
