import { Request, Response } from 'express';
import session from 'express-session';
import * as _ from 'lodash';
import { Address } from '../../../app/clients/classes/Address';
import { OSPlacesClient } from '../../../app/clients/OSPlacesClient';
import {
  getManualEnterAddressPage,
  postManualEnterAddressPage,
  setupContactDetailsController
} from '../../../app/controllers/appeal-application/contact-details';
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
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();
  const osPlacesClient = new OSPlacesClient('someToken');

  const address = {
    line1: '',
    line2: '',
    city: '',
    county: '',
    postcode: 'postcode'
  };
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let submitStub: sinon.SinonStub;

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
      } as Partial<session.Session>,
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    updateAppealService = { submitEventRefactored: submitStub } as Partial<UpdateAppealService>;

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupContactDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      const middleware = [];
      setupContactDetailsController(middleware, { updateAppealService, osPlacesClient } as any);
      expect(routerGetStub.calledWith(paths.appealStarted.enterAddress, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.enterAddress, middleware)).to.equal(true);
    });
  });

  describe('getManualEnterAddressPage', () => {
    it('should render appeal-application/personal-details/enter-address.njk', function () {
      req.session.appeal.application.personalDetails.address = {
        ...address
      };
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: paths.appealStarted.contactDetails
      });
    });

    it('should redirect to previous page', function () {
      req.session.appeal.application.personalDetails.address = {
        ...address
      };
      req.session.previousPage = '/lastpage';
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/enter-address.njk', {
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
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: paths.appealStarted.contactDetails
      });
      expect(req.session.appeal.application.isEdit).to.have.eq(true);

    });

    it('should render appeal-application/personal-details/enter-address.njk with address from CCD if page loaded without postcode lookup', function () {
      req.session.appeal.application.addressLookup = {};
      _.set(req.session.appeal.application, 'personalDetails.address', { ...address });
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/enter-address.njk', {
        address,
        previousPage: paths.appealStarted.contactDetails
      });
    });

    it('should catch an exception and call next()', () => {
      req.session.appeal.application.addressLookup = {
        result: {
          addresses: [
            new Address('buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'formattedAddress', 'udprn')
          ]
        }
      };
      const error = new Error('the error');
      res.render = renderStub.throws(error);
      getManualEnterAddressPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
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
      updateAppealService.submitEventRefactored = submitStub.returns({
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

      expect(submitStub.called).to.equal(false);
      expect(renderStub.calledWith('appeal-application/personal-details/enter-address.njk')).to.equal(true);
    });

    it('should validate and redirect to has sponsor page', async () => {
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(redirectStub.calledWith(paths.appealStarted.hasSponsor)).to.equal(true);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });

    it('when in edit mode should validate and redirect to CYA page and reset the isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_APPEAL, appeal, 'idamUID', 'atoken')).to.equal(true);
      expect(req.session.appeal.application.isEdit).to.equal(undefined);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should redirect to task list and not validate if nothing selected and save for later clicked', async () => {
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.common.overview + '?saved')).to.equal(true);
    });

    it('should redirect to CYA page and not validate if nothing selected and save for later clicked and reset isEdit flag', async () => {
      req.session.appeal.application.isEdit = true;
      appeal.application.isEdit = true;
      req.body = {
        'saveForLater': 'saveForLater'
      };
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.called).to.equal(false);
      expect(redirectStub.calledWith(paths.appealStarted.checkAndSend)).to.equal(true);
    });

    it('should catch an exception and call next()', async () => {
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      await postManualEnterAddressPage(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
