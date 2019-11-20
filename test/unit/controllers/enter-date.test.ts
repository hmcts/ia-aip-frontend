const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getDateOfBirthPage,
  postDateOfBirth,
  setupPersonalDetailsController,
  updateAppealService
} from '../../../app/controllers/personal-details';
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
      redirect: sinon.spy()
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
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.dob);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.dob);
    });
  });

  describe('getDateOfBirthPage', () => {
    it('should render appeal-application/personal-details/date-of-birth.njk', () => {
      getDateOfBirthPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/date-of-birth.njk');
    });
  });

  describe('postDateOfBirth', () => {
    it('should validate and redirect to next page personal-details/nationality', async () => {
      req.body.day = 1;
      req.body.month = 11;
      req.body.year = 1993;

      req.session.personalDetails = {};

      // @ts-ignore
      sinon.stub(updateAppealService, 'updateAppeal').resolves({});

      await postDateOfBirth(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.personalDetails.nationality);
    });
  });

  describe('Should catch an error.', function () {
    it('getDateOfBirthPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getDateOfBirthPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render appeal-application/personal-details/date-of-birth.njk with error', async () => {
      req.body.day = 0;
      req.body.month = 0;
      req.body.year = 0;

      await postDateOfBirth(req as Request, res as Response, next);

      const errorDay = {
        href: '#day',
        key: 'day',
        text: 'Needs to be above 0.'
      };

      const errorMonth = {
        href: '#month',
        key: 'month',
        text: 'Needs to be above 0.'
      };

      const errorYear = {
        href: '#year',
        key: 'year',
        text: 'Needs to be above 0.'
      };

      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/date-of-birth.njk',
        {
          errors: {
            day: errorDay,
            month: errorMonth,
            year: errorYear
          },
          errorList: [ errorDay, errorMonth, errorYear ]
        });
    });
  });
});
