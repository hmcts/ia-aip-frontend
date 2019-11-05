import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getAppealLate,
  getDateLetterSent,
  getHomeOfficeDetails,
  postAppealLate,
  postDateLetterSent,
  postDeleteEvidence,
  postHomeOfficeDetails,
  postUploadEvidence,
  setupHomeOfficeDetailsController
} from '../../../app/controllers/home-office-details';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

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
      session: {
        appealApplication: {},
        appeal: {
          application: {},
          caseBuilding: {},
          hearingRequirements: {}
        } as Appeal
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
      expect(routerGetStub).to.have.been.calledWith(paths.homeOffice.details);
      expect(routerPOSTStub).to.have.been.calledWith(paths.homeOffice.details);
      expect(routerGetStub).to.have.been.calledWith(paths.homeOffice.letterSent);
      expect(routerPOSTStub).to.have.been.calledWith(paths.homeOffice.letterSent);
      expect(routerGetStub).to.have.been.calledWith(paths.homeOffice.appealLate);
      expect(routerPOSTStub).to.have.been.calledWith(paths.homeOffice.appealLate);
    });
  });

  describe('getHomeOfficeDetails', () => {
    it('should render home-office/details.njk', function () {
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/details.njk');
    });

    it('should catch exception and call next with the error', function () {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHomeOfficeDetails', () => {
    it('should validate and redirect home-office/details.njk', () => {
      req.body['homeOfficeRefNumber'] = 'A1234567';
      postHomeOfficeDetails(req as Request, res as Response, next);

      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.letterSent);
    });

    it('should fail validation and render home-office/details.njk with error', () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      postHomeOfficeDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          error: i18n.validationErrors.homeOfficeRef
        });
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      postHomeOfficeDetails(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDateLetterSent', () => {
    it('should render home-office/letter-sent.njk', () => {
      getDateLetterSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk');
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getDateLetterSent(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDateLetterSent', () => {
    it('should validate and redirect to Task list page if letter is not older than 14 days', () => {
      const date = moment().subtract(14, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      postDateLetterSent(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should validate and redirect to Appeal Late page', () => {
      const date = moment().subtract(15, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      postDateLetterSent(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.appealLate);
    });

    it('should fail validation if the date is in the future and render error', () => {
      const date = moment().add(10, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      postDateLetterSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk');
    });

    it('should fail validation and render error', () => {
      req.body['day'] = '1';
      req.body['month'] = '1';
      req.body['year'] = '20190';
      const yearError = {
        text: 'Needs to be a valid date.',
        href: '#year',
        key: 'year'
      };
      const error = {
        year: yearError
      };
      const errorList = [ yearError ];
      postDateLetterSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk',
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

  describe('getAppealLate', () => {
    it('should render home-office-letter-sent.njk', () => {
      getAppealLate(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk');
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getAppealLate(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postAppealLate', () => {
    it('should fail validation and render appeal-application/home-office/appeal-late.njk with errors', () => {
      req.body['appeal-late'] = '';
      postAppealLate(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk');
    });

    it('should validate and render home-office-appeal-late.njk with errors', () => {
      req.body['appeal-late'] = 'My exlplanation why am late';
      postAppealLate(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      postAppealLate(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postUploadEvidence', () => {
    it('should upload file and render home-office-appeal-late.njk', () => {
      const description: string = 'an evidence description';
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      const fileList = {
        [file.originalname]: {
          file_name: file.originalname,
          value: file.mimetype,
          description
        }
      };
      req.file = file as Express.Multer.File;
      req.body['file-description'] = description;
      postUploadEvidence(req as Request, res as Response, next);
      expect(req.session.appealApplication.files).to.be.deep.equal(fileList);
      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.appealLate);
    });

    it('should fail validation and render appeal-application/home-office/appeal-late.njk with errors', () => {
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };

      const error: ValidationError = {
        key: 'file-description',
        href: '#file-description',
        text: i18n.validationErrors.required
      };

      req.file = file as Express.Multer.File;

      postUploadEvidence(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk', {
        appealLate: null,
        evidences: [],
        error: { 'file-description': error },
        errorList: [ error ]
      });
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      postUploadEvidence(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDeleteEvidence', () => {
    it('should delete file', () => {
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      const fileList = {
        [file.originalname]: {
          file_name: file.originalname,
          value: file.mimetype
        }
      };

      req.session.appealApplication.files = fileList;
      req.body.delete = { 'file.png': 'delete' };
      postDeleteEvidence(req as Request, res as Response, next);
      expect(req.session.appealApplication.files).to.be.deep.equal({});
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      postDeleteEvidence(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
