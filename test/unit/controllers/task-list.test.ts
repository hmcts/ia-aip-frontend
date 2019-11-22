import { NextFunction, Request, Response } from 'express';
import { getTaskList, setupTaskListController } from '../../../app/controllers/task-list';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Task List Controller', () => {
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
            tasks: {
              homeOfficeDetails: {
                saved: false,
                completed: false
              },
              personalDetails: {
                saved: false,
                completed: false
              },
              contactDetails: {
                saved: false,
                completed: false
              },
              typeOfAppeal: {
                saved: false,
                completed: false
              },
              checkAndSend: {
                saved: false,
                completed: false
              }
            }
          } as Partial<AppealApplication>,
          caseBuilding: {},
          hearingRequirements: {}
        } as Appeal
      } as Partial<Express.Session>,
      sectionStatuses: {},
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
      render: sandbox.stub()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

    setupTaskListController();
    expect(routerGetStub).to.have.been.calledWith(paths.taskList);
  });

  it('getTaskList should render task-list.njk', () => {
    getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/task-list.njk');
  });

  it('getTaskList should render task-list.njk with status data', () => {
    const mockData = [
      {
        'sectionId': 'yourDetails',
        'tasks': [
          { 'id': 'homeOfficeDetails', 'saved': false, 'complete': false },
          { 'id': 'personalDetails', 'saved': false, 'complete': false },
          { 'id': 'contactDetails', 'saved': false, 'complete': false } ]
      },
      {
        'sectionId': 'appealDetails',
        'tasks': [ { 'id': 'typeOfAppeal', 'saved': false, 'complete': false } ]
      },
      {
        'sectionId': 'checkAndSend',
        'tasks': [ { 'id': 'checkAndSend', 'saved': false, 'complete': false } ]
      } ];

    getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/task-list.njk', { data: mockData });
  });

  it('getTaskList should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getTaskList(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
