import { Express, NextFunction, Request, Response } from 'express';
import session from 'express-session';
import {
  setupHearingBundleFeatureToggleController,
  setupHearingRequirementsFeatureToggleController
} from '../../../../app/controllers/hearing-requirements/hearings-feature-toggle';
import {
  hearingBundleFeatureMiddleware, hearingRequirementsMiddleware
} from '../../../../app/middleware/hearing-requirements-middleware';
import { paths } from '../../../../app/paths';
import LaunchDarklyService from '../../../../app/service/launchDarkly-service';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('setupHearingRequirementsFeatureToggleController', () => {
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

  it('should redirect to taskList page if the hearing requirements is enabled', async () => {
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    setupHearingRequirementsFeatureToggleController([hearingRequirementsMiddleware]);
    expect(routerGetStub.calledWith(paths.submitHearingRequirements.taskList)).to.equal(true);
  });
});
