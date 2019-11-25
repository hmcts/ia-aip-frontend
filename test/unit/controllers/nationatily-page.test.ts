const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getNationalityPage, postNationalityPage, setupPersonalDetailsController } from '../../../app/controllers/personal-details';
import { countryList } from '../../../app/data/country-list';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';

import Logger from '../../../app/utils/logger';
import { getNationalitiesOptions } from '../../../app/utils/nationalities';
import { expect, sinon } from '../../utils/testUtils';

describe('Nationality details Controller', function() {
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
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any,
      session: {
        appeal: {
          application: {
            personalDetails: {}
          }
        }
      }
    } as unknown as Partial<Request>;

    res = {
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
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.nationality);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.nationality);
    });
  });

  describe('getNationalityPage', () => {
    it('should render personal-details/nationality.njk', function () {
      getNationalityPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/nationality.njk');
    });
  });

  describe('postNationality', () => {
    it('should validate and render personal-details/nationality.njk', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = 'stateless';
      req.body.nationality = '';

      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/nationality.njk');
    });

    it('should validate and render personal-details/nationality.njk', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = '';
      req.body.nationality = 'British';

      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/nationality.njk');
    });
  });

  describe('Should catch an error.', function () {
    it('getNationalityPage should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getNationalityPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('should fail validation and render personal-details/nationality.njk with error when nothing selected', () => {
      postNationalityPage(req as Request, res as Response, next);
      req.body.stateless = '';
      req.body.nationality = '';
      const nationalitiesOptions = getNationalitiesOptions(countryList, '');
      const error = {
        href: '#nationality',
        key: 'nationality-statelessNationality',
        text: 'Select your Nationality'
      };
      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/nationality.njk',
        {
          errorList: [error],
          errors: { 'nationality-statelessNationality': error },
          nationalitiesOptions,
          statelessNationality: undefined
        });
    });

    it('should fail validation and render personal-details/nationality.njk with error when nationality and state selected', () => {
      req.body.statelessNationality = 'stateless';
      req.body.nationality = 'Taiwan';
      postNationalityPage(req as Request, res as Response, next);
      const nationalitiesOptions = getNationalitiesOptions(countryList, req.body.nationality);
      const error = {
        href: '#nationality',
        key: 'nationality-statelessNationality',
        text: 'Only select one option'
      };

      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/nationality.njk',
        {
          errorList: [error],
          errors: { 'nationality-statelessNationality': error },
          nationalitiesOptions,
          statelessNationality: 'stateless'
        });
    });
  });
});
