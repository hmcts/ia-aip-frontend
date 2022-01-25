import { Express, NextFunction, Request, Response } from 'express';
import {
 setupOutOfCountryFeatureToggleController
} from '../../../../app/controllers/out-of-country/ooc-feature-toggle';
import {
  outOfCountryFeatureMiddleware
} from '../../../../app/middleware/outofcountry-feature-middleware';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('setupOutOfCountryFeatureToggleController', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          application: {}
        }
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
      redirect: sandbox.spy(),
      clearCookie: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  // there are no paths to write any reasonable tests here
  it('should redirect to overview page if the hearing bundle feature is disabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-bundle-feature', false).resolves(false);
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    const router = setupOutOfCountryFeatureToggleController([outOfCountryFeatureMiddleware]);
    expect(router).not.null;
  });
});
