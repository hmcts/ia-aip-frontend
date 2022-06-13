import { NextFunction, Request, Response } from 'express';
import {
  checkAppealEnded,
  checkEnableProvideMoreEvidenceSection,
  getAppealRefNumber,
  getApplicationOverview,
  getHearingDetails,
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
  const headers = {};
  let mockAuthenticationService: Partial<AuthenticationService>;
  let mockCcdService: Partial<CcdService>;
  let updateAppealService: Partial<UpdateAppealService>;

  const logger: Logger = new Logger();
  const expectedNextStep = {
    cta: { url: '/about-appeal' },
    deadline: null,
    descriptionParagraphs: [
      'You need to answer a few questions about yourself and your appeal to get started.',
      'You will need to have your Home Office decision letter with you to answer some questions.'
    ],
    info: null,
    allowedAskForMoreTime: false
  };

  const expectedHistory = {
    appealArgumentSection: [ {
      'date': '27 February 2020',
      'dateObject': sinon.match.any,
      'text': 'You told us why you think the Home Office decision to refuse your claim is wrong.',
      'links': [
        {
          'title': 'What you sent',
          'text': 'Why you think the Home Office is wrong',
          'href': '{{ paths.common.reasonsForAppealViewer }}'
        }, {
          'title': 'Useful documents',
          'text': 'Home Office documents about your case',
          'href': '{{ paths.common.homeOfficeDocumentsViewer }}'
        }, {
          'title': 'Helpful information',
          'text': 'Understanding your Home Office documents',
          'href': '{{ paths.common.homeOfficeDocuments }}'
        } ]
    }
    ],
    appealDetailsSection: [ {
      'date': '27 February 2020',
      'dateObject': sinon.match.any,
      'text': 'You sent your appeal details to the Tribunal.',
      'links': [
        {
          'title': 'What you sent',
          'text': 'Your appeal details',
          'href': '{{ paths.common.appealDetailsViewer }}'
        }, {
          'title': 'Helpful information',
          'text': 'What is a Tribunal Caseworker?',
          'href': '{{ paths.common.tribunalCaseworker }}'
        } ]
    } ]
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockAuthenticationService = {
      getSecurityHeaders: sandbox.stub().returns(headers)
    } as Partial<AuthenticationService>;
    mockCcdService = {
      getCaseHistory: sandbox.stub().returns(expectedMultipleEventsData)
    } as Partial<CcdService>;

    updateAppealService = {
      getAuthenticationService: sandbox.stub().returns(mockAuthenticationService),
      getCcdService: sandbox.stub().returns(mockCcdService)
    };
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: {},
            personalDetails: {}
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
    expect(routerGetStub).to.have.been.calledWith(paths.common.overview);
  });

  it('getApplicationOverview should render application-overview.njk with options and IDAM name', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.appealReferenceNumber = 'DRAFT';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
      appealRefNumber: null,
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      payLater: false,
      hearingDetails: null
    });
  });

  it('getApplicationOverview should render application-overview.njk with options and IDAM name and no events', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
      appealRefNumber: undefined,
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      payLater: false,
      hearingDetails: null
    });
  });

  it('getApplicationOverview should render application-overview.njk with options and IDAM name', async () => {
    req.idam = {
      userDetails: {
        uid: 'user-id',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.appealReferenceNumber = 'appealNumber';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
      appealRefNumber: 'appealNumber',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      payLater: false,
      hearingDetails: null
    });
  });

  it('getApplicationOverview should render with appealRefNumber application-overview.njk with options and IDAM name', async () => {
    req.idam = {
      userDetails: {
        uid: 'user-id',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.application.homeOfficeRefNumber = 'A1234567';
    req.session.appeal.appealReferenceNumber = 'RP/50004/2020';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      allowedAskForMoreTime: false,
      cta: { url: '/about-appeal' },
      deadline: null,
      descriptionParagraphs: [
        'You need to finish telling us about your appeal.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null
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
      appealRefNumber: 'RP/50004/2020',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      payLater: false,
      hearingDetails: null
    });
  });

  it('getApplicationOverview should render with appealRefNumber application-overview.njk with options and entered name @justthis', async () => {
    req.idam = {
      userDetails: {
        uid: 'user-id',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'appealStarted';
    req.session.appeal.application.homeOfficeRefNumber = 'A1234567';
    req.session.appeal.appealReferenceNumber = 'RP/50004/2020';
    req.session.appeal.application.personalDetails.givenNames = 'Appellant';
    req.session.appeal.application.personalDetails.familyName = 'Name';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      allowedAskForMoreTime: false,
      cta: { url: '/about-appeal' },
      deadline: null,
      descriptionParagraphs: [
        'You need to finish telling us about your appeal.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null
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
      name: 'Appellant Name',
      appealRefNumber: 'RP/50004/2020',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      payLater: false,
      hearingDetails: null
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

  it('getAppealRefNumber with inital draft ', () => {
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

  it('checkAppealEnded with ended case ', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: 'ended'
        }
      }
    };
    const { appealStatus } = req.session.appeal;
    const result = checkAppealEnded(appealStatus);
    expect(result).to.equal(true);
  });

  it('checkAppealEnded with case not ended', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: 'draft'
        }
      }
    };
    const { appealStatus } = req.session.appeal;
    const result = checkAppealEnded(appealStatus);
    expect(result).to.equal(false);
  });

  it('checkEnableProvideMoreEvidenceSection should return false', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: 'preHearing'
        }
      }
    };
    const featureFlagEnabled = false;
    const { appealStatus } = req.session.appeal;
    const result = checkEnableProvideMoreEvidenceSection(appealStatus, featureFlagEnabled);
    expect(result).to.equal(false);
  });

  it('checkEnableProvideMoreEvidenceSection should return true', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: 'preHearing'
        }
      }
    };
    const featureFlagEnabled = true;
    const { appealStatus } = req.session.appeal;
    const result = checkEnableProvideMoreEvidenceSection(appealStatus, featureFlagEnabled);
    expect(result).to.equal(true);
  });

  it('getHearingDetails with case not ended', () => {
    req.session.appeal.hearing = {
      hearingCentre: 'taylorHouse',
      date: '2022-02-02T20:30:00.000',
      time: '240'
    };
    const result = getHearingDetails(req as Request);
    expect(result.hearingCentre).to.equal('Taylor House');
    expect(result.date).to.equal('02 February 2022');
    expect(result.time).to.equal('8:30 pm');
  });
});
