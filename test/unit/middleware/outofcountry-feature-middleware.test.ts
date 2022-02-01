import { NextFunction, Request, Response } from 'express';
import { any } from 'joi';
import {
  outOfCountryFeatureMiddleware
} from '../../../app/middleware/outofcountry-feature-middleware';
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
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should redirect to respective hearings page if the out of county feature  is enabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(true);
    req.path = paths.common.overview;
    await outOfCountryFeatureMiddleware(req as Request, res as Response, next);
    expect(next).to.have.been.called;
  });

  it('should redirect to respective hearings page if the out of county feature  is enabled disabled', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'aip-ooc-feature', false).resolves(false);
    req.path = paths.common.overview;
    await outOfCountryFeatureMiddleware(req as Request, res as Response, next);
    expect(res.redirect).to.have.been.called.calledWith(paths.common.overview);
  });
});
