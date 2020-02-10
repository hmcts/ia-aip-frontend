const express = require('express');
import { NextFunction, Request, Response } from 'express';
import { getApplicationOverview, setupApplicationOverviewController } from '../../../app/controllers/application-overview';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
const jwt = require('jsonwebtoken');

const token = jwt.sign({
  forename: 'John',
  surname: 'Smith'
}, 'secret', { expiresIn: '1h' });

describe('Overview Controller', function() {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      cookies: {
        ['__auth-token']: token
      },
      path: '/oauth2/token',
      method: 'POST',
      session: {
        appeal: {
          application: {
            lateAppeal: {}
          },
          caseBuilding: {},
          hearingRequirements: {}
        } as Appeal
      } as Partial<Express.Session>,
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupOverviewController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupApplicationOverviewController();
      expect(routerGetStub).to.have.been.calledWith(paths.overview);
    });
  });

  describe('getOverview Page', () => {
    it('get overview should render application-overview.njk', function () {
      getApplicationOverview(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk');
    });
  });
});
