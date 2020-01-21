import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
} from '../../../app/controllers/home-office-details';
import { paths } from '../../../app/paths';
import { Events } from '../../../app/service/ccd-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
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
    });
  });

  describe('getHomeOfficeDetails', () => {
    it('should render home-office/details.njk', function () {
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/home-office/details.njk');
    });

    it('when called with edit param should render home-office/details.njk and update session', function () {
      req.query = { 'edit': '' };
      getHomeOfficeDetails(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
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

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.letterSent);
    });

    it('when save for later should validate and redirect task-list.njk', async () => {
      req.body['homeOfficeRefNumber'] = 'A1234567';
      req.body['saveForLater'] = 'saveForLater';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('when in edit mode should validate and redirect check-and-send.njk and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;

      req.body['homeOfficeRefNumber'] = 'A1234567';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(req.session.appeal.application.homeOfficeRefNumber).to.be.eql('A1234567');
      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);

    });

    it('should fail validation and render home-office/details.njk with error', async () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number in the correct format'
      };
      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [ error ],
          homeOfficeRefNumber: 'notValid',
          previousPage: paths.taskList
        });
    });

    it('when save for later should fail validation and render home-office/details.njk with error', async () => {
      req.body['homeOfficeRefNumber'] = 'notValid';
      req.body['saveForLater'] = 'saveForLater';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number in the correct format'
      };
      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [ error ],
          homeOfficeRefNumber: 'notValid',
          previousPage: paths.taskList
        });
    });

    it('when save and continue should fail validation due to blank home office reference and render home-office/details.njk with error', async () => {
      req.body['homeOfficeRefNumber'] = '';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const error = {
        href: '#homeOfficeRefNumber',
        key: 'homeOfficeRefNumber',
        text: 'Enter the Home Office reference number'
      };
      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith(
        'appeal-application/home-office/details.njk',
        {
          errors: {
            homeOfficeRefNumber: error
          },
          errorList: [ error ],
          homeOfficeRefNumber: '',
          previousPage: paths.taskList
        });
    });

    it('should redirect to path list when save for later and home office ref numnber is blank', async () => {
      req.body['homeOfficeRefNumber'] = '';
      req.body['saveForLater'] = 'saveForLater';
      await postHomeOfficeDetails(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
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

    it('when called with edit param should render home-office/letter-sent.njk and update session', () => {
      req.query = { 'edit': '' };

      getDateLetterSent(req as Request, res as Response, next);
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
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
    it('should validate and redirect to Task list page', async () => {
      const date = moment().subtract(14, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should validate and redirect to CYA page and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;

      const date = moment().subtract(14, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);

    });

    it('should validate and redirect to Appeal Late page', async () => {
      const date = moment().subtract(15, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('when save for later should validate and redirect to task list page', async () => {
      const date = moment().subtract(15, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      req.body.saveForLater = 'saveForLater';
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should redirect to task list when save for later and blank date', async () => {
      const date = moment().subtract(15, 'd');
      req.body['day'] = '';
      req.body['month'] = '';
      req.body['year'] = '';
      req.body.saveForLater = 'saveForLater';
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should validate and redirect to Appeal Late page and isEdit flag is not updated', async () => {
      req.session.appeal.application.isEdit = true;

      const date = moment().subtract(15, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const { dateLetterSent } = req.session.appeal.application;
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_APPEAL, req);
      expect(dateLetterSent.day).to.be.eql(date.format('DD'));
      expect(dateLetterSent.month).to.be.eql(date.format('MM'));
      expect(dateLetterSent.year).to.be.eql(date.format('YYYY'));

      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);

    });

    it('should fail validation if the date is in the future and render error', async () => {
      const date = moment().add(10, 'd');
      req.body['day'] = date.format('DD');
      req.body['month'] = date.format('MM');
      req.body['year'] = date.format('YYYY');
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
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

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('appeal-application/home-office/letter-sent.njk',
        {
          error,
          errorList,
          dateLetterSent: { ...req.body },
          previousPage: paths.homeOffice.details
        }
      );
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await postDateLetterSent(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.not.have.been.called;
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
