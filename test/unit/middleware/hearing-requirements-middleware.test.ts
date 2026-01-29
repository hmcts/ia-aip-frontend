import { NextFunction, Response } from 'express';
import type { Request } from 'express-serve-static-core';
import session from 'express-session';
import {
  hearingBundleFeatureMiddleware,
  hearingRequirementsMiddleware
} from '../../../app/middleware/hearing-requirements-middleware';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import { expect, sinon } from '../../utils/testUtils';
describe('hearingRequirementsMiddleware', () => {
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
        locals: {
          logger: {}
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      clearCookie: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    req.app.locals.logger.trace = function () { // dummy function
    };
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should redirect to overview page if the hearing requirements is disabled', async () => {
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    let getVariationStub = sandbox.stub(LaunchDarklyService.prototype, 'getVariation');
    for (let hearingRequirementEndPoint in paths.submitHearingRequirements) {
      const reqWithPath: Partial<Request> = {
        ...req,
        path: hearingRequirementEndPoint
      };
      getVariationStub.withArgs(reqWithPath as Request, 'aip-hearing-requirements-feature', false).resolves(false);
      await hearingRequirementsMiddleware(reqWithPath as Request, res as Response, next);
      expect(res.redirect).to.have.been.called.calledWith(paths.common.overview);
    }
  });

  it('should redirect to respective hearing requirements page if the hearing requirements is enabled', async () => {
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    let getVariationStub = sandbox.stub(LaunchDarklyService.prototype, 'getVariation');
    for (let hearingRequirementEndPoint in paths.submitHearingRequirements) {
      const reqWithPath: Partial<Request> = {
        ...req,
        path: hearingRequirementEndPoint
      };
      getVariationStub.withArgs(reqWithPath as Request, 'aip-hearing-requirements-feature', false).resolves(true);
      await hearingRequirementsMiddleware(reqWithPath as Request, res as Response, next);
      expect(next).to.have.been.called;
    }
  });

  it('should redirect to respective hearings page if the hearing bundle feature is enabled', async () => {
    const reqWithPath: Partial<Request> = {
      ...req,
      path: paths.common.overview
    };
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(reqWithPath as Request, 'aip-hearing-bundle-feature', false).resolves(true);
    await hearingBundleFeatureMiddleware(reqWithPath as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should redirect to overview page if the hearing bundle feature is disabled', async () => {
    const reqWithPath: Partial<Request> = {
      ...req,
      path: paths.common.overview
    };
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(reqWithPath as Request, 'aip-hearing-bundle-feature', false).resolves(false);
    await hearingBundleFeatureMiddleware(reqWithPath as Request, res as Response, next);
    expect(res.redirect).to.have.been.called.calledWith(paths.common.overview);
  });
});
