import { NextFunction, Request, Response } from 'express';
import {
  getTaskList,
  setupSubmitHearingRequirementsTaskListController
} from '../../../../app/controllers/hearing-requirements/task-list';
import { paths } from '../../../../app/paths';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Submit Hearing Requirements Task List Controller', () => {
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
          application: {} as Partial<AppealApplication>,
          reasonsForAppeal: {} as Partial<ReasonsForAppeal>,
          cmaRequirements: {},
          hearingRequirements: {
            tasks: {
              witnesses: {
                saved: false,
                completed: false,
                active: true
              },
              accessNeeds: {
                saved: false,
                completed: false,
                active: false
              },
              otherNeeds: {
                saved: false,
                completed: false,
                active: false
              },
              datesToAvoid: {
                saved: false,
                completed: false,
                active: false
              },
              checkAndSend: {
                saved: false,
                completed: false,
                active: false
              }
            }
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>,
      sectionStatuses: {},
      cookies: {},
      idam: {
        userDetails: {} as Partial<IdamDetails>
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    const middleware = [];
    setupSubmitHearingRequirementsTaskListController(middleware);
    expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.taskList);
  });

  it('getTaskList should render task-list.njk', () => {
    getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/task-list.njk');
  });

  it('getTaskList should render task-list.njk with status data', () => {
    const mockData = [ {
      'sectionId': 'witnesses',
      'tasks': [ { 'id': 'witnesses', 'saved': false, 'completed': false, 'active': true }]
    }, {
      'sectionId': 'accessNeeds',
      'tasks': [ { 'id': 'accessNeeds', 'saved': false, 'completed': false, 'active': false } ]
    }, {
      'sectionId': 'otherNeeds',
      'tasks': [ { 'id': 'otherNeeds', 'saved': false, 'completed': false, 'active': false } ]
    }, {
      'sectionId': 'datesToAvoid',
      'tasks': [ { 'id': 'datesToAvoid', 'saved': false, 'completed': false, 'active': false } ]
    }, {
      'sectionId': 'checkAndSend',
      'tasks': [ { 'id': 'checkAndSend', 'saved': false, 'completed': false, 'active': false } ]
    } ];

    getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('hearing-requirements/task-list.njk', {
      previousPage: paths.common.overview,
      data: mockData
    });
  });

  it('getTaskList should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getTaskList(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
