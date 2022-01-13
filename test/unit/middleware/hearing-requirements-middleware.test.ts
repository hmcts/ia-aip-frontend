import { NextFunction, Request, Response } from 'express';
import { any } from 'joi';
import {
  hearingRequirementsMiddleware
} from '../../../app/middleware/hearing-requirements-middleware';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import { expect, sinon } from '../../utils/testUtils';

describe('hearingRequirementsMiddleware', () => {
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

  it('should redirect to overview page if the hearing requirements is disabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-requirements-feature', false).resolves(false);
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    for (let hearingRequirementEndPoint in paths.submitHearingRequirements) {
      req.path = hearingRequirementEndPoint;
      await hearingRequirementsMiddleware(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.called.calledWith(paths.common.overview);
    }
  });

  it('should redirect to respective hearing requirements page if the hearing requirements is enabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-hearing-requirements-feature', false).resolves(true);
    req.session.appeal.appealStatus = 'submitHearingRequirements';

    for (let hearingRequirementEndPoint in paths.submitHearingRequirements) {
      req.path = hearingRequirementEndPoint;
      await hearingRequirementsMiddleware(req as Request, res as Response, next);
      expect(next).to.have.been.called;
    }
  });
});
