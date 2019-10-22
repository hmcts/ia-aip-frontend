const express = require('express');
import { NextFunction, Response } from 'express';
import { getNamePage, postNamePage, setupPersonalDetailsController } from '../../../app/controllers/personal-details-get-names';
import { Request } from '../../../app/domain/request';
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
      expect(routerGetStub).to.have.been.calledWith(paths.enterName);
      expect(routerPOSTStub).to.have.been.calledWith(paths.enterName);
    });
  });

  describe('getNamesPage', () => {
    it('should render get-names-page.njk', function () {
      getNamePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('get-names-page.njk');
    });
  });

  describe('postNamePage', () => {
    it('should validate and render get-names-page.njk', () => {
      req.body.givenNames = 'Lewis';
      req.body.familyName = 'Williams';
      postNamePage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
                'get-names-page.njk',
        {
          familyName: 'Williams',
          givenNames: 'Lewis'
        });
    });
  });

  describe('Should catch an error.', function () {
    it('getPageName should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNamePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render get-names-page.njk with error', () => {
      req.body.givenNames = '';
      req.body.familyName = '';
      postNamePage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
          'get-names-page.njk',
        {
          errors: {
            errorList: [{ href: '#', text: 'Please Enter Given Names' }, { href: '#', text: 'Please Enter Family Name' }],
            fieldErrors: {
              familyName: { text: 'Please Enter Family Name' },
              givenNames: { text: 'Please Enter Given Names' }
            }
          }
        });
    });
  });
});
