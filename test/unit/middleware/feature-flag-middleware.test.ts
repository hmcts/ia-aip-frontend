import config from 'config';
import { NextFunction, Request, Response } from 'express';
import { featureFlagMiddleware } from '../../../app/middleware/feature-flag-middleware';
import { asBooleanValue } from '../../../app/utils/utils';
import { expect, sinon } from '../../utils/testUtils';

describe('#feature-flag-middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    res = {
      locals: {}
    } as any;
    next = sandbox.stub();
  });

  it('calls next function', () => {
    featureFlagMiddleware(req, res, next);

    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('adds features to req.local', () => {
    featureFlagMiddleware(req, res, next);
    expect(res.locals.featuresEnabled).to.eql({
      'askForMoreTime': asBooleanValue(config.get('features.askForMoreTime')),
      'timelineEnabled': asBooleanValue(config.get('features.timelineEnabled'))
    });
  });
});
