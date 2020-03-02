import { NextFunction, Request, Response } from 'express';
import {
  getApplicationOverview,
  setupApplicationOverviewController
} from '../../../app/controllers/application-overview';
import { paths } from '../../../app/paths';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
import { expectedMultipleEventsData } from '../mockData/events/expectations';

const express = require('express');

describe('Confirmation Page Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

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
        userDetails: {} as Partial<IdamDetails>
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

    setupApplicationOverviewController(updateAppealService as UpdateAppealService);
    expect(routerGetStub).to.have.been.calledWith(paths.overview);
  });

  it('getApplicationOverview should render application-overview.njk with options and completed section', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';

    const headers = {};
    const mockAuthenticationService = {
      getSecurityHeaders: sinon.stub().returns(headers)
    } as Partial<AuthenticationService>;
    const mockCcdService = {
      getCaseHistory: sinon.stub().returns(expectedMultipleEventsData)
    } as Partial<CcdService>;

    updateAppealService = {
      getAuthenticationService: sinon.stub().returns(mockAuthenticationService),
      getCcdService: sinon.stub().returns(mockCcdService)
    };

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      cta: '/about-appeal',
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

    const expectedHistory = [ {
      'date': '03 March 2020',
      'title': 'Your appeal details',
      'text': 'You sent your appeal details to the Tribunal.',
      links: [{ href: '/view/appeal-details', text: 'Your appeal details', title: 'What you sent' }, {
        href: '/tribunal-caseworker',
        text: 'What is a Tribunal Caseworker',
        title: 'Helpful information'
      }]
    }, {
      'date': '03 March 2020',
      'title': 'Your appeal argument',
      'text': 'You told us why you think the Home Office decision to refuse your claim is wrong.',
      'links': [ {
        'title': 'What you sent',
        'text': 'Why you think the Home Office is wrong',
        'href': '/view/reasons-for-appeal'
      }, {
        'title': 'Useful documents',
        'text': 'Home Office documents about your case',
        'href': '/view/home-office-documents'
      }, {
        'title': 'Helpful information',
        'text': 'Understanding your Home Office documents',
        'href': '/home-office-documents'
      } ]
    } ];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false
    });
  });

  it('getApplicationOverview should render application-overview.njk with options and no events', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';

    const headers = {};
    const mockAuthenticationService = {
      getSecurityHeaders: sinon.stub().returns(headers)
    } as Partial<AuthenticationService>;
    const mockCcdService = {
      getCaseHistory: sinon.stub().returns([])
    } as Partial<CcdService>;

    updateAppealService = {
      getAuthenticationService: sinon.stub().returns(mockAuthenticationService),
      getCcdService: sinon.stub().returns(mockCcdService)
    };

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      cta: paths.taskList,
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
      history: [],
      stages: expectedStages,
      saved: false
    });
  });

  it('getApplicationOverview should catch an exception and call next()', async () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);

    req.session.appeal.appealStatus = 'appealStarted';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
