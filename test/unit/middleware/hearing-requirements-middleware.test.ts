import { NextFunction, Request, Response } from 'express';
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
    redirectStub = sinon.stub();
    res = {
      render: sandbox.stub(),
      redirect: redirectStub,
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

  it('should redirect to respective hearing requirements page if the hearing requirements is enabled', async () => {
    req.session.appeal.appealStatus = 'submitHearingRequirements';
    const getVariationStub = sandbox.stub(LaunchDarklyService.prototype, 'getVariation');
    for (const hearingRequirementEndPoint in paths.submitHearingRequirements) {
      const reqWithPath: Partial<Request> = {
        ...req,
        path: hearingRequirementEndPoint
      };
      await hearingRequirementsMiddleware(reqWithPath as Request, res as Response, next);
      expect(next.called).to.equal(true);
    }
  });

  it('should redirect to respective hearings page', async () => {
    const reqWithPath: Partial<Request> = {
      ...req,
      path: paths.common.overview
    };
    await hearingBundleFeatureMiddleware(reqWithPath as Request, res as Response, next);
    expect(next.called).to.equal(true);
  });
});
