import { Address, AddressInfoResponse, OSPlacesClient, Point } from '@hmcts/os-places-client';
import { NextFunction, Request, Response } from 'express';
import {
  getPostcodeLookupPage,
  postPostcodeLookupPage,
  setupPersonalDetailsController
} from '../../../app/controllers/personal-details';
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
  let lookupByPostcodeStub;

  let next: NextFunction;
  const logger: Logger = new Logger();

  const osPlacesClient = new OSPlacesClient('someToken');

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: null
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>,
      body: {},
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
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
    lookupByPostcodeStub = sandbox.stub(osPlacesClient, 'lookupByPostcode');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupPersonalDetailsController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
      const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');
      setupPersonalDetailsController({ updateAppealService });
      expect(routerGetStub).to.have.been.calledWith(paths.personalDetails.postcodeLookup);
      expect(routerPOSTStub).to.have.been.calledWith(paths.personalDetails.postcodeLookup);
    });
  });

  describe('getPostcodeLookupPage', () => {
    it('should redirect to enter postcode page if postcode not present', async () => {
      await getPostcodeLookupPage(osPlacesClient)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.personalDetails.enterPostcode);
    });

    it('should render appeal-application/personal-details/postcode-lookup.njk', async () => {
      req.session.appeal.application.addressLookup = {
        postcode: 'W1W 7RT'
      } as any;

      lookupByPostcodeStub.withArgs('W1W 7RT').resolves({
        addresses: [
          { uprn: '1', formattedAddress: 'first address' } as Address,
          { uprn: '2', formattedAddress: 'second address' } as Address
        ]
      } as AddressInfoResponse);

      await getPostcodeLookupPage(osPlacesClient)(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/postcode-lookup.njk');
    });

    it('should catch an exception and call next()', async () => {
      req.session.appeal.application.addressLookup = {
        postcode: 'W1W 7RT'
      } as any;
      lookupByPostcodeStub.withArgs('W1W 7RT').resolves({
        addresses: [
          { uprn: '1', formattedAddress: 'first address' } as Address,
          { uprn: '2', formattedAddress: 'second address' } as Address
        ]
      } as AddressInfoResponse);

      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);

      await getPostcodeLookupPage(osPlacesClient)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postPostcodeLookupPage', () => {
    it('should fail validation and render postcode-lookup.njk', function () {
      req.body.address = '';
      const addresses = [ new Address('123', 'organisationName', 'departmentName', 'poBoxNumber', 'buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'postcodeType', 'formattedAddress', new Point('type', [1, 2]), 'udprn') ];
      req.session.appeal.application.addressLookup = {
        result: { addresses }
      } as any;
      postPostcodeLookupPage(req as Request, res as Response, next);
      const error = { href: '#address', key: 'address', text: 'Select your address' };
      expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/personal-details/postcode-lookup.njk',
        {
          addresses: [{ text: '1 address found', value: '' }, { text: 'formattedAddress', value: 'udprn' }],
          error: { address: error },
          errorList: [ error ],
          previousPage: paths.personalDetails.enterPostcode
        }
      );
    });

    it('should validate and redirect to task list page', function () {
      req.body.address = 'an address';
      postPostcodeLookupPage(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(paths.personalDetails.enterAddress);
    });

    it('should catch an exception and call next()', () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      req.body.address = '123';
      postPostcodeLookupPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
