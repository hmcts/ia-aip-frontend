const express = require('express');
import { NextFunction, Request, Response } from 'express';
import {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
} from '../../../app/controllers/home-office-details';
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
      send: sandbox.stub(),
      redirect: sandbox.spy()
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

      expect(req.session.appealApplication['homeOfficeReference']).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.homeOfficeLetterSent);
    });

    it('should fail validation and render home-office-details.njk with error', () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      postHomeOfficeDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office-details.njk',
        {
          error: i18n.validationErrors.homeOfficeRef,
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

  describe('getDateLetterSent', () => {
    it('should render home-office-letter-sent.njk', () => {
      getDateLetterSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office-letter-sent.njk');
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getDateLetterSent(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDateLetterSent', () => {
    it('should validate and render home-office-letter-sent.njk', () => {
      req.body['day'] = '1';
      req.body['month'] = '1';
      req.body['year'] = '2019';
      postDateLetterSent(req as Request, res as Response, next);

      const { homeOfficeDateLetterSent } = req.session.appealApplication;
      expect(homeOfficeDateLetterSent.day).to.be.eql('1');
      expect(homeOfficeDateLetterSent.month).to.be.eql('1');
      expect(homeOfficeDateLetterSent.year).to.be.eql('2019');

      expect(res.render).to.have.been.calledWith('appeal-application/home-office-letter-sent.njk');
    });

    it('should fail validation and render error', () => {
      req.body['day'] = '1';
      req.body['month'] = '1';
      req.body['year'] = '20190';
      const yearError = {
        text: 'Needs to be a valid date.',
        href: '#year'
      };
      const error = {
        year: yearError
      };
      const errorList = [ yearError ];
      postDateLetterSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office-letter-sent.njk',
        {
          error,
          errorList
        }
      );
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      postDateLetterSent(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

});
