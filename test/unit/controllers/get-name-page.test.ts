const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getNamePage, postNamePage, setupPersonalDetailsController, updateAppealService } from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Home Office Details Controller', function () {
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
      session: {
        appeal: {
          application: {}
        }
      },
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
      send: sandbox.stub(),
      redirect: sandbox.spy()
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
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.name);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.name);
    });
  });

  describe('getNamesPage', () => {
    it('should render personal-details/name.njk', function () {
      getNamePage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/name.njk');
    });
  });

  describe('postNamePage', () => {
    it('should validate and redirect to next page personal-details/date-of-birth', async () => {
      req.body.givenNames = 'Lewis';
      req.body.familyName = 'Williams';
      req.session.personalDetails = {};

      // @ts-ignore
      sinon.stub(updateAppealService, 'updateAppeal').resolves({});

      await postNamePage(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.personalDetails.dob);
    });
  });

  describe('Should catch an error.', () => {
    it('getPageName should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNamePage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render personal-details/name.njk with error', async () => {
      req.body.givenNames = '';
      req.body.familyName = '';
      await postNamePage(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/name.njk',
        {
          errors: {
            errorList: [ { href: '#givenNames', text: 'Please Enter Given Names' }, {
              href: '#familyName',
              text: 'Please Enter Family Name'
            } ],
            fieldErrors: {
              familyName: { text: 'Please Enter Family Name' },
              givenNames: { text: 'Please Enter Given Names' }
            }
          }
        });
    });
  });
});
