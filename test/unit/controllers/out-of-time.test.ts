import { NextFunction, Request, Response } from 'express';
import {
  getAppealLate,
  getDeleteEvidence,
  postAppealLate,
  postUploadEvidence,
  setupOutOfTimeController
} from '../../../app/controllers/out-of-time';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Out of time controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;

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
        locals: {}
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
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

      setupOutOfTimeController(updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.homeOffice.appealLate);
      expect(routerPostStub).to.have.been.calledWith(paths.homeOffice.appealLate);
      expect(routerPostStub).to.have.been.calledWith(paths.homeOffice.uploadEvidence);
      expect(routerGetStub).to.have.been.calledWith(paths.homeOffice.deleteEvidence);
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
    const file = {
      originalname: 'file.png',
      mimetype: 'type'
    };
    const fileObject = {
      'someId': {
        id: 'someId',
        name: file.originalname,
        url: file.originalname
      }
    };

    it('should validate and redirect to Task List', async () => {
      req.body['appeal-late'] = 'My explanation why am late';
      await postAppealLate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('should validate and upload a file and redirect to Task list', async () => {
      const whyAmLate = 'My explanation why am late';
      req.body['appeal-late'] = whyAmLate;
      req.file = file as Express.Multer.File;

      await postAppealLate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(req.session.appeal.application.lateAppeal.reason).to.be.equal(whyAmLate);
      expect(req.session.appeal.application.lateAppeal.evidences).to.be.deep.equal(fileObject);
      expect(res.redirect).to.have.been.calledWith(paths.taskList);
    });

    it('when in edit mode should validate and redirect to CYA and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      req.body['appeal-late'] = 'My explanation why am late';
      await postAppealLate(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.checkAndSend);
      expect(req.session.appeal.application.isEdit).to.have.eq(false);

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
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      const fileObject = {
        'someId': {
          id: 'someId',
          name: file.originalname,
          url: file.originalname
        }
      };
      req.file = file as Express.Multer.File;
      postUploadEvidence(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAppeal.evidences).to.be.deep.equal(fileObject);
      expect(res.redirect).to.have.been.calledWith(paths.homeOffice.appealLate);
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      postUploadEvidence(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDeleteEvidence', () => {
    it('should delete file', () => {
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      const fileObject = {
        id: 'someId',
        url: file.originalname,
        name: file.originalname
      };

      req.session.appeal.application.lateAppeal = {
        evidences: { 'someId': fileObject }
      };

      getDeleteEvidence(req as Request, res as Response, next);
      expect(req.session.appeal.application.lateAppeal.evidences).to.be.equal(null);
    });

    it('should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.redirect = sandbox.stub().throws(error);
      getDeleteEvidence(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
