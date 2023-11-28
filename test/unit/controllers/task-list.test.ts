import { NextFunction, Request, Response } from 'express';
import { getTaskList, setupTaskListController } from '../../../app/controllers/appeal-application/task-list';
import { paths } from '../../../app/paths';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
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
                completed: false,
                active: true
              },
              personalDetails: {
                saved: false,
                completed: false,
                active: false
              },
              contactDetails: {
                saved: false,
                completed: false,
                active: false
              },
              typeOfAppeal: {
                saved: false,
                completed: false,
                active: false
              },
              typeOfAppealAndDecision: {
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
          } as Partial<AppealApplication>,
          reasonsForAppeal: {},
          hearingRequirements: {}
        } as Appeal
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
    setupTaskListController(middleware);
    expect(routerGetStub).to.have.been.calledWith(paths.appealStarted.taskList);
  });

  it('getTaskList should render task-list.njk', async () => {
    await getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/task-list.njk');
  });

  it('getTaskList should render task-list.njk with status data payments flag OFF', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'online-card-payments-feature', false).resolves(false);
    const mockData = [
      {
        'sectionId': 'yourDetails',
        'tasks': [
          { 'id': 'typeOfAppeal', 'saved': false, 'completed': false, 'active': true },
          { 'id': 'homeOfficeDetails', 'saved': false, 'completed': false, 'active': false },
          { 'id': 'personalDetails', 'saved': false, 'completed': false, 'active': false },
          { 'id': 'contactDetails', 'saved': false, 'completed': false, 'active': false } ]
      },
      {
        'sectionId': 'decisionType',
        'tasks': [ { 'id': 'decisionType', 'saved': false, 'completed': false, 'active': false } ]
      },
      {
        'sectionId': 'checkAndSend',
        'tasks': [ { 'id': 'checkAndSend', 'saved': false, 'completed': false, 'active': false } ]
      } ];

    await getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/task-list.njk', { data: mockData });
  });

  it('getTaskList should render task-list.njk with status data payments flag ON', async () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, 'online-card-payments-feature', false).resolves(true);
    const mockData = [
      {
        'sectionId': 'yourDetails',
        'tasks': [
          { 'id': 'typeOfAppeal', 'saved': false, 'completed': false, 'active': true },
          { 'id': 'homeOfficeDetails', 'saved': false, 'completed': false, 'active': false },
          { 'id': 'personalDetails', 'saved': false, 'completed': false, 'active': false },
          { 'id': 'contactDetails', 'saved': false, 'completed': false, 'active': false } ]
      },
      {
        'sectionId': 'decisionType',
        'tasks': [ { 'id': 'decisionType', 'saved': false, 'completed': false, 'active': false } ]
      },
      {
        'sectionId': 'checkAndSend',
        'tasks': [ { 'id': 'checkAndSendWithPayments', 'saved': false, 'completed': false, 'active': false } ]
      } ];

    await getTaskList(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/task-list.njk', { data: mockData });
  });

  it('getTaskList should catch an exception and call next()', async () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    await getTaskList(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
