const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getDateOfBirthPage,
  postDateOfBirth,
  setupPersonalDetailsController
} from '../../../app/controllers/personal-details';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Personal Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
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

    updateAppealService = { updateAppeal: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDateOfBirthController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupPersonalDetailsController({ updateAppealService });
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

      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
      function createError(fieldName, errorMessage) {
        return {
          href: `#${fieldName}`,
          key: fieldName,
          text: errorMessage
        };
      }

      req.body.day = 0;
      req.body.month = 0;
      req.body.year = 0;

      await postDateOfBirth(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const errorDay = createError('day', 'Enter the date in the correct format');
      const errorMonth = createError('month', 'Enter the date in the correct format');
      const errorYear = createError('year', 'Enter the date in the correct format');

      expect(res.render).to.have.been.calledWith(
        'appeal-application/personal-details/date-of-birth.njk',
        {
          dob: { day: 0, month: 0, year: 0 },
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
