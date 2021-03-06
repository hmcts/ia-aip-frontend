import { Address, Point } from '@hmcts/os-places-client';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import {
  getManualEnterAddressPage,
  postManualEnterAddressPage,
  setupPersonalDetailsController
} from '../../../app/controllers/appeal-application/personal-details';
import { Events } from '../../../app/data/events';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Personal Details Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;

  let next: NextFunction;
  const logger: Logger = new Logger();

  const address = {
    line1: '',
    line2: '',
    city: '',
    county: '',
    postcode: 'postcode'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
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
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupPersonalDetailsController(middleware, { updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.enterAddress, middleware);
      expect(routerPOSTStub).to.have.been.calledWith(paths.appealStarted.enterAddress, middleware);
    });
  });

  describe('getManualEnterAddressPage', () => {
    it('should render appeal-application/personal-details/enter-address.njk', function () {
      req.session.appeal.application.personalDetails.address = {
        ...address
      };
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: paths.appealStarted.nationality
      });
    });

    it('should redirect to previous page', function () {
      req.session.appeal.application.personalDetails.address = {
        ...address
      };
      req.session.previousPage = '/lastpage';
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: '/lastpage'
      });
    });

    it('when called with edit param should render appeal-application/personal-details/enter-address.njk and update session', function () {
      req.query = { 'edit': '' };
      req.session.appeal.application.personalDetails.address = {
        ...address
      };
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: paths.appealStarted.nationality
      });
      expect(req.session.appeal.application.isEdit).to.have.eq(true);

    });

    it('should render appeal-application/personal-details/enter-address.njk with address from CCD if page loaded without postcode lookup', function () {
      req.session.appeal.application.addressLookup = {};
      _.set(req.session.appeal.application, 'personalDetails.address', { ...address });
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: paths.appealStarted.nationality
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
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postManualEnterAddress', () => {
    let appeal: Appeal;
    beforeEach(() => {
      req.body['address-line-1'] = '60 GPS';
      req.body['address-town'] = 'London';
      req.body['address-county'] = 'London';
      req.body['address-line-2'] = '';
      req.body['address-postcode'] = 'W1W 7RT';
      appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            address: {
              line1: req.body['address-line-1'],
              line2: req.body['address-line-2'],
              city: req.body['address-town'],
              county: req.body['address-county'],
              postcode: req.body['address-postcode']
            }
          }
        }
      };
      updateAppealService.submitEventRefactored = sandbox.stub().returns({
        application: {
          personalDetails: {
            address: {
              line1: req.body['address-line-1'],
              line2: req.body['address-line-2'],
              city: req.body['address-town'],
              county: req.body['address-county'],
              postcode: req.body['address-postcode']
            }
          }
        }
      } as Appeal);
    });
    it('should fail validation and render appeal-application/personal-details/enter-address.njk', async () => {
      req.body['address-postcode'] = 'W';
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).not.to.have.been.called;
      expect(res.render).to.have.been.calledWith('appeal-application/personal-details/enter-address.njk');
    });

    it('should validate and redirect to task list page', async () => {
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.taskList);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });

    it('when in edit mode should validate and redirect to CYA page and reset the isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken');
      expect(req.session.appeal.application.isEdit).to.be.undefined;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.common.overview + '?saved');
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(paths.appealStarted.checkAndSend);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
