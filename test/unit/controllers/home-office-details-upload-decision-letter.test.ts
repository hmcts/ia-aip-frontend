import { Address, Point } from '@hmcts/os-places-client';
import { NextFunction, Request, Response } from 'express';
import {
  deleteHomeOfficeDecisionLetter,
  getHomeOfficeDecisionLetter,
  postHomeOfficeDecisionLetter,
  SetupHomeOfficeDecisionLetterController,
  uploadHomeOfficeDecisionLetter,
  validate
} from '../../../app/controllers/appeal-application/home-office-details-upload-decision-letter';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { createStructuredError } from '../../../app/utils/validations/fields-validations';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Home office decision letter', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      query: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      session: {
        appeal: {
          application: {
            personalDetails: {}
          }
        } as Appeal
      } as Partial<Express.Session>,
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy(),
      locals: {}
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
    documentManagementService = { uploadFile: sandbox.stub(), deleteFile: sandbox.stub() } as Partial<DocumentManagementService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('SetupHomeOfficeDecisionLetterController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      new SetupHomeOfficeDecisionLetterController().initialise(middleware, updateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetterDelete);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetterUpload);
    });
  });

  describe('getHomeOfficeDecisionLetter', () => {
    it('should render template', function () {
      getHomeOfficeDecisionLetter(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/multiple-evidence-upload-page.njk');
    });

    it('should render template and update edit flag in session', function () {
      req.query = { 'edit': '' };
      getHomeOfficeDecisionLetter(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/multiple-evidence-upload-page.njk');
      expect(req.session.appeal.application.isEdit).to.have.eq(true);
    });

    it('should render template with validation errors', function () {
      req.query = { error: 'error' };
      const validationErrors = { uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`]) };
      getHomeOfficeDecisionLetter(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('templates/multiple-evidence-upload-page.njk', {
        title: i18n.pages.homeOfficeLetterUpload.title,
        content: i18n.pages.homeOfficeLetterUpload.content,
        formSubmitAction: paths.appealStarted.homeOfficeDecisionLetter,
        evidenceUploadAction: paths.appealStarted.homeOfficeDecisionLetterUpload,
        evidences: [],
        evidenceCTA: paths.appealStarted.homeOfficeDecisionLetterDelete,
        previousPage: paths.appealStarted.letterSent,
        saveForLaterCTA: paths.common.overview,
        error: validationErrors,
        errorList: Object.values(validationErrors)
      });
    });

    it('should catch an exception and call next()', () => {
      req.session.appeal.application.addressLookup = {
        result: {
          addresses: [
            new Address('123', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [ 1, 2 ]), 'udprn')
          ]
        }
      };
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getHomeOfficeDecisionLetter(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHomeOfficeDecisionLetter', () => {
    it('should redirect to \'/home-office-upload-decision-letter\' if no home office letter upload', async () => {
      postHomeOfficeDecisionLetter(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.appealStarted.homeOfficeDecisionLetter}?error=noFileSelected`);
    });

    it('should redirect to \'/about-appeal\' if home office letter upload present and not in editing mode', async () => {
      req.session.appeal.application.homeOfficeLetter = [{ fileId: 'id', name: 'name' } as Evidence];
      postHomeOfficeDecisionLetter(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('should redirect to \'/check-answers\' if home office letter upload present and in editing mode', async () => {
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.homeOfficeLetter = [{ fileId: 'id', name: 'name' } as Evidence];
      postHomeOfficeDecisionLetter(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.application.isEdit = true;
      req.session.appeal.application.homeOfficeLetter = [{ fileId: 'id', name: 'name' } as Evidence];
      postHomeOfficeDecisionLetter(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect to \'/home-office-upload-decision-letter\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('uploadHomeOfficeDecisionLetter', () => {
    it('should upload a file', async () => {
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadHomeOfficeDecisionLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.uploadFile).to.have.been.called;
      expect(updateAppealService.submitEventRefactored).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
    });

    it('should redirect to \'/home-office-upload-decision-letter\' with no file selected error', async () => {
      await uploadHomeOfficeDecisionLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.appealStarted.homeOfficeDecisionLetter}?error=noFileSelected`);
    });

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      await uploadHomeOfficeDecisionLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('deleteHomeOfficeDecisionLetter', () => {
    it('should delete an evidence', async () => {
      req.session.appeal.application.homeOfficeLetter = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [ { id: 'anId', url: 'documentStoreUrl' } ];
      req.query.id = 'anId';
      await deleteHomeOfficeDecisionLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(documentManagementService.deleteFile).to.have.been.called;
      expect(updateAppealService.submitEventRefactored).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.homeOfficeDecisionLetter);
    });

    it('should catch an error and call next with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.session.appeal.application.homeOfficeLetter = [{ fileId: 'anId', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ id: 'anId', url: 'documentStoreUrl' }];
      req.query.id = 'anId';
      await deleteHomeOfficeDecisionLetter(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
