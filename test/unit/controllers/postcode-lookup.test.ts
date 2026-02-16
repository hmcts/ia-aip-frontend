import { Request, Response } from 'express';
import session from 'express-session';
import { Address } from '../../../app/clients/classes/Address';
import { AddressInfoResponse } from '../../../app/clients/classes/AddressInfoResponse';
import { OSPlacesClient } from '../../../app/clients/OSPlacesClient';
import {
  ContactDetailsControllerDependencies,
  getPostcodeLookupPage,
  postPostcodeLookupPage,
  setupContactDetailsController
} from '../../../app/controllers/appeal-application/contact-details';
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
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;
  let next: sinon.SinonStub;
  const logger: Logger = new Logger();

  const osPlacesClient = new OSPlacesClient('someToken');

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: null,
            personalDetails: {},
            addressLookup: {
              result: null
            }
          }
        } as Partial<Appeal>
      } as Partial<session.Session>,
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

    renderStub = sandbox.stub();
    redirectStub = sandbox.stub();

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;

    next = sandbox.stub();

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
      const middleware = [];
      setupContactDetailsController(middleware, {
        updateAppealService,
        osPlacesClient
      } as ContactDetailsControllerDependencies);
      expect(routerGetStub.calledWith(paths.appealStarted.postcodeLookup, middleware)).to.equal(true);
      expect(routerPOSTStub.calledWith(paths.appealStarted.postcodeLookup, middleware)).to.equal(true);
    });
  });

  describe('getPostcodeLookupPage', () => {
    it('should redirect to enter postcode page if postcode not present', async () => {
      await getPostcodeLookupPage(osPlacesClient)(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.appealStarted.enterPostcode)).to.equal(true);
    });

    it('should render appeal-application/personal-details/postcode-lookup.njk', async () => {
      req.session.appeal.application.personalDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      } as any;

      lookupByPostcodeStub.withArgs('W1W 7RT').resolves({
        addresses: [
          { udprn: '1', formattedAddress: 'first address' } as Address,
          { udprn: '2', formattedAddress: 'second address' } as Address
        ]
      } as AddressInfoResponse);

      await getPostcodeLookupPage(osPlacesClient)(req as Request, res as Response, next);
      expect(renderStub.calledOnceWith('appeal-application/personal-details/postcode-lookup.njk')).to.equal(true);
    });

    it('should catch an exception and call next()', async () => {
      req.session.appeal.application.personalDetails = {
        address: {
          postcode: 'W1W 7RT'
        }
      } as any;
      lookupByPostcodeStub.withArgs('W1W 7RT').resolves({
        addresses: [
          { udprn: '1', formattedAddress: 'first address' } as Address,
          { udprn: '2', formattedAddress: 'second address' } as Address
        ]
      } as AddressInfoResponse);

      const error = new Error('the error');
      res.render = renderStub.throws(error);

      await getPostcodeLookupPage(osPlacesClient)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postPostcodeLookupPage', () => {
    const addresses = [new Address('buildingName', 'subBuildingName', 2, 'thoroughfareName', 'dependentThoroughfareName', 'dependentLocality', 'doubleDependentLocality', 'postTown', 'postcode', 'formattedAddress', 'udprn')];

    it('should fail validation and render postcode-lookup.njk', function () {
      req.session.appeal.application = {
        personalDetails: {
          address: {
            postcode: 'W1W 7RT'
          }
        },
        addressLookup: {
          result: { addresses }
        }
      } as any;
      postPostcodeLookupPage(req as Request, res as Response, next);
      const error = { href: '#address', key: 'address', text: 'Select your address' };
      expect(renderStub).to.be.calledOnceWith('appeal-application/personal-details/postcode-lookup.njk',
        {
          addresses: [{ text: '1 address found', value: '' }, { text: 'formattedAddress', value: 'udprn' }],
          error: { address: error },
          errorList: [error],
          previousPage: paths.appealStarted.enterPostcode
        }
      );
    });

    it('should validate and redirect to task list page', function () {
      req.session.appeal.application = {
        personalDetails: {
          address: {
            postcode: 'W1W 7RT'
          }
        },
        addressLookup: {
          result: { addresses }
        }
      } as any;
      req.body.address = 'an address';
      postPostcodeLookupPage(req as Request, res as Response, next);
      expect(redirectStub.calledOnceWith(paths.appealStarted.enterAddress)).to.equal(true);
    });

    it('should catch an exception and call next()', () => {
      req.session.appeal.application = {
        personalDetails: {
          address: {
            postcode: 'W1W 7RT'
          }
        },
        addressLookup: {
          result: { addresses }
        }
      } as any;
      const error = new Error('the error');
      res.redirect = redirectStub.throws(error);
      req.body.address = '123';
      postPostcodeLookupPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
