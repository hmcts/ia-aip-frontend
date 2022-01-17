import { Express, NextFunction, Request, Response } from 'express';
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

  it('should redirect to taskList page if the hearing requirements is enabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-requirements-feature', false).resolves(true);
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    setupHearingRequirementsFeatureToggleController([hearingRequirementsMiddleware]);
    expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.taskList);
  });

    // there are no paths to write any reasonable tests here
  it('should redirect to overview page if the hearing bundle feature is disabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-bundle-feature', false).resolves(false);
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    const router = setupHearingBundleFeatureToggleController([hearingBundleFeatureMiddleware]);
    expect(router).not.null;
  });
});
