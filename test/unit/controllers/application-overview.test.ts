import { NextFunction, Request, Response } from 'express';
import {
  getApplicationOverview,
  setupApplicationOverviewController
} from '../../../app/controllers/application-overview';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Confirmation Page Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

    setupApplicationOverviewController();
    expect(routerGetStub).to.have.been.calledWith(paths.overview);
  });

  it('getApplicationOverview should render application-overview.njk with options', () => {
    req.idam = {
      userDetails: {
        forename: 'Alex',
        surname: 'Developer'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';

    getApplicationOverview(req as Request, res as Response, next);

    const expectedNextStep = {
      cta: '/task-list',
      deadline: null,
      descriptionParagraphs: [
        'You need to answer a few questions about yourself and your appeal to get started.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: {
        title: null,
        url: null
      }
    };

    const expectedStages = [ {
      active: true,
      ariaLabel: 'Your appeal details stage',
      completed: false,
      title: 'Your appeal<br/> details'
    }, {
      active: false,
      ariaLabel: 'Your appeal argument stage',
      completed: false,
      title: 'Your appeal<br/> argument'
    }, {
      active: false,
      ariaLabel: 'Your hearing details stage',
      completed: false,
      title: 'Your hearing<br/> details'
    }, {
      active: false,
      ariaLabel: 'Your appeal decision stage',
      completed: false,
      title: 'Your appeal<br/> decision'
    } ];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      applicationNextStep: expectedNextStep,
      history: null,
      stages: expectedStages,
      saved: false
    });
  });

  it('getApplicationOverview should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);

    req.session.appeal.appealStatus = 'appealStarted';

    getApplicationOverview(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
