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
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Home Office Details Controller', function () {
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
      session: {
        appeal: {
          application: {
            lateAppeal: {}
          },
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

    updateAppealService = { submitEvent: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHomeOfficeDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupHomeOfficeDetailsController(updateAppealService as UpdateAppealService);
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
    it('should validate and redirect home-office/details.njk', async () => {
      req.body['homeOfficeRefNumber'] = 'A1234567';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.letterSent);
    });

    it('should fail validation and render home-office/details.njk with error', async () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number in the correct format'
      };
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [ error ],
          homeOfficeRefNumber: 'notValid'
        });
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
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
    it('should validate and redirect to Task list page if letter is not older than 14 days', async () => {
      const date = moment().subtract(14, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should validate and redirect to Appeal Late page', async () => {
      const date = moment().subtract(15, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.appealLate);
    });

    it('should fail validation if the date is in the future and render error', async () => {
      const date = moment().add(10, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk');
    });

    it('should fail validation and render error', async () => {
      req.body['day'] = '1';
      req.body['month'] = '1';
      req.body['year'] = moment().year() + 1;
      const dateError = {
        text: 'The date letter was sent must be in the past',
        href: '#date',
        key: 'date'
      };
      const error = {
        date: dateError
      };
      const errorList = [ dateError ];
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk',
        {
          error,
          errorList,
          dateLetterSent: { ...req.body }
        }
      );
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
    it('should fail validation and render appeal-application/home-office/appeal-late.njk with errors', async () => {
      req.body['appeal-late'] = '';
      await postAppealLate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/appeal-late.njk');
    });

    it('should validate and redirect to Task List', async () => {
      req.body['appeal-late'] = 'My exlplanation why am late';
      await postAppealLate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postAppealLate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
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
          name: file.originalname,
          url: file.originalname,
          description
        }
      };
      req.file = file as Express.Multer.File;
      req.body['file-description'] = description;
      postUploadEvidence(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAppeal.evidences).to.be.deep.equal(fileList);
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
          url: file.originalname,
          name: file.originalname,
          description: 'desc'
        }
      };

      req.session.appeal.application.lateAppeal = {
        evidences: fileList
      };

      req.body.delete = { 'file.png': 'delete' };
      postDeleteEvidence(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAppeal.evidences).to.be.deep.equal({});
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      postDeleteEvidence(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
