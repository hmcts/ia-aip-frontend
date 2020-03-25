import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import {
  getAppealRefNumber,
  getApplicationOverview,
  setupApplicationOverviewController
} from '../../../app/controllers/application-overview';
import { paths } from '../../../app/paths';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import { dayMonthYearFormat } from '../../../app/utils/date-formats';
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

  it('getApplicationOverview should render application-overview.njk with options', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.appealReferenceNumber = 'DRAFT';

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
      cta: { respondByText: null, url: '/about-appeal' },
      deadline: null,
      descriptionParagraphs: [
        'You need to answer a few questions about yourself and your appeal to get started.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null,
      allowedAskForMoreTime: false
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
    const date = moment().format(dayMonthYearFormat);

    const expectedHistory = [ {
      'date': date,
      'title': 'Your appeal details',
      'text': 'You sent your appeal details to the Tribunal.',
      'links': [
        {
          'href': '{{ paths.detailsViewers.appealDetails }}',
          'text': 'Your appeal details',
          'title': 'What you sent'
        }, {
          'href': '{{ paths.tribunalCaseworker }}',
          'text': 'What is a Tribunal Caseworker',
          'title': 'Helpful information'
        } ]
    }, {
      'date': date,
      'title': 'Your appeal argument',
      'text': 'You told us why you think the Home Office decision to refuse your claim is wrong.',
      'links': [
        {
          'title': 'What you sent',
          'text': 'Why you think the Home Office is wrong',
          'href': '{{ paths.detailsViewers.reasonsForAppeal }}'
        }, {
          'title': 'Useful documents',
          'text': 'Home Office documents about your case',
          'href': '{{ paths.detailsViewers.homeOfficeDocuments }}'
        }, {
          'title': 'Helpful information',
          'text': 'Understanding your Home Office documents',
          'href': '{{ paths.homeOfficeDocuments }}'
        } ]
    } ];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: null,
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      askForMoreTimeFeatureEnabled: false
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
      cta: { respondByText: null, url: '/about-appeal' },
      deadline: null,
      descriptionParagraphs: [
        'You need to answer a few questions about yourself and your appeal to get started.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null,
      allowedAskForMoreTime: false
    };

    const expectedStages = [{
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
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: undefined,
      applicationNextStep: expectedNextStep,
      history: [],
      stages: expectedStages,
      saved: false,
      askForMoreTimeFeatureEnabled: false
    });
  });

  it('getApplicationOverview should render application-overview.njk with options', async () => {
    req.idam = {
      userDetails: {
        uid: 'user-id',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.appealReferenceNumber = 'appealNumber';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      allowedAskForMoreTime: false,
      cta: { respondByText: null, url: '/about-appeal' },
      deadline: null,
      descriptionParagraphs: [
        'You need to answer a few questions about yourself and your appeal to get started.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null
    };

    const expectedStages = [{
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
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'appealNumber',
      applicationNextStep: expectedNextStep,
      history: [],
      stages: expectedStages,
      saved: false,
      askForMoreTimeFeatureEnabled: false
    });
  });

  it('getApplicationOverview should render with appealRefNumber application-overview.njk with options', async () => {
    req.idam = {
      userDetails: {
        uid: 'user-id',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.application.homeOfficeRefNumber = 'A1234567';
    req.session.appeal.appealReferenceNumber = 'RP/50004/2020';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      allowedAskForMoreTime: false,
      cta: { respondByText: null, url: '/about-appeal' },
      deadline: 'TBC',
      descriptionParagraphs: [
        'You need to finish telling us about your appeal.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null
    };

    const expectedStages = [{
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
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'RP/50004/2020',
      applicationNextStep: expectedNextStep,
      history: [],
      stages: expectedStages,
      saved: false,
      askForMoreTimeFeatureEnabled: false
    });
  });

  it('getApplicationOverview should catch an exception and call next()', async () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);

    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.appealReferenceNumber = 'appealNumber';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('getAppealRefNumber with appeal ref number', () => {
    const req = {
      session: {
        appeal: {
          appealReferenceNumber: 'RP/5004/2020'

        }
      }
    };
    const { appealReferenceNumber } = req.session.appeal;
    const result = getAppealRefNumber(appealReferenceNumber);
    expect(result).to.equal(appealReferenceNumber);
  });

  it('getAppealRefNumber with inital draft ',() => {
    const req = {
      session: {
        appeal: {
          appealReferenceNumber: 'DRAFT'
        }
      }
    };
    const { appealReferenceNumber } = req.session.appeal;
    const result = getAppealRefNumber(appealReferenceNumber);
    expect(result).to.equal(null);
  });
});
