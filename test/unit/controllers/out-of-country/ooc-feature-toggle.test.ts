import { Express, NextFunction, Request, Response } from 'express';
import session from 'express-session';
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
  let next: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          application: {}
        }
      } as Partial<session.Session>,
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

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });
});
