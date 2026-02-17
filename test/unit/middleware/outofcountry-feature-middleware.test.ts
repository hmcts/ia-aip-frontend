import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
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
  let next: sinon.SinonStub;
  let redirectStub: sinon.SinonStub;

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
    redirectStub = sandbox.stub();

    res = {
      render: sandbox.stub(),
      redirect: redirectStub,
      clearCookie: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    req.app.locals.logger.trace = function () { // dummy function
    };
    next = sandbox.stub() ;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should redirect to respective hearings page if the out of county feature  is enabled', async () => {
    const reqWithPath: Partial<Request> = {
      ...req,
      path: paths.common.overview
    };
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(reqWithPath as Request, 'aip-ooc-feature', false).resolves(true);
    await outOfCountryFeatureMiddleware(reqWithPath as Request, res as Response, next);
    expect(next.called).to.equal(true);
  });

  it('should redirect to respective hearings page if the out of county feature  is enabled disabled', async () => {
    const reqWithPath: Partial<Request> = {
      ...req,
      path: paths.common.overview
    };
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(reqWithPath as Request, 'aip-ooc-feature', false).resolves(false);
    await outOfCountryFeatureMiddleware(reqWithPath as Request, res as Response, next);
    expect(redirectStub.calledWith(paths.common.overview)).to.equal(true);
  });
});
