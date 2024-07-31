import { NextFunction, Request, Response } from 'express';
import { SinonStub } from 'sinon';
import {
  checkAppealEnded,
  checkEnableProvideMoreEvidenceSection,
  getAppealRefNumber,
  getAppellantName,
  getApplicationOverview,
  getHearingDetails,
  isAppealInProgress,
  isPostDecisionState,
  setupApplicationOverviewController,
  showAppealRequestSection,
  showAppealRequestSectionInAppealEndedStatus,
  showFtpaApplicationLink,
  showHearingRequestSection
} from '../../../app/controllers/application-overview';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { States } from '../../../app/data/states';
import { paths } from '../../../app/paths';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CcdService } from '../../../app/service/ccd-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
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
    descriptionParagraphs: [
      'You need to answer a few questions about yourself and your appeal to get started.',
      'You will need to have your Home Office decision letter with you to answer some questions.'
    ],
    info: null,
    cta: { url: '/about-appeal' },
    allowedAskForMoreTime: false,
    deadline: null
  };

  const expectedHistory = {
    appealArgumentSection: [{
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
        }]
    }
    ],
    appealDetailsSection: [{
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
        }]
    }]
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

    sandbox.stub(LaunchDarklyService.prototype, 'getVariation')
      .withArgs(req as Request, FEATURE_FLAGS.MAKE_APPLICATION, false).resolves(true)
      .withArgs(req as Request, FEATURE_FLAGS.FTPA, false).resolves(true)
      .withArgs(req as Request, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false).resolves(true)
      .withArgs(req as Request, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false).resolves(true);

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

  it('getApplicationOverview should render application-overview.njk with options and IDAM name#2', async () => {
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

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: true,
      completed: false
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: false
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: false
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: false
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: null,
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      showAppealRequests: false,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: false,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: false
    });
  });

  it('getApplicationOverview should render application-overview.njk with isPostDecisionState', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'decided';
    req.session.appeal.isDecisionAllowed = 'allowed';
    req.session.appeal.appealReferenceNumber = 'PA/12345/2025';
    req.session.appeal.finalDecisionAndReasonsDocuments = [
      {
        fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
        name: 'DC 50016 2024-test 1650 27022024-Decision-and-reasons-Cover-letter-FINAL.pdf',
        id: '1',
        tag: 'finalDecisionAndReasonsPdf',
        dateUploaded: '2024-02-28'
      }
    ];

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: false,
      completed: true
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: true
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: true
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: true
    }];

    const appNextStep = {
      decision: 'allowed',
      descriptionParagraphs: [
        'A judge has <b> {{ applicationNextStep.decision }} </b> your appeal. <br>',
        '<p>The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.</p><br> <a href={{ paths.common.decisionAndReasonsViewer }}>Read the Decision and Reasons document</a>'
      ],
      info: {
        title: 'Appeal Information',
        text: 'If you disagree with this decision, you have until <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> to apply for permission to appeal to the Upper Tribunal.',
        url: '<a href="{{ paths.ftpa.ftpaApplication }}">Apply for permission to appeal to the Upper Tribunal</a>'
      },
      cta: {},
      allowedAskForMoreTime: false,
      deadline: '13 March 2024'
    };

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'PA/12345/2025',
      applicationNextStep: appNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: true,
      showAppealRequests: true,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: true,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: true
    });
  });

  it('getApplicationOverview should enable paymentLink in decided with ftpa enabled', async () => {
    req.idam = {
      userDetails: {
        uid: 'anId',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'decided';
    req.session.appeal.isDecisionAllowed = 'allowed';
    req.session.appeal.appealReferenceNumber = 'PA/12345/2025';
    req.session.appeal.application.appealType = 'protection';
    req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
    req.session.appeal.finalDecisionAndReasonsDocuments = [
      {
        fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
        name: 'DC 50016 2024-test 1650 27022024-Decision-and-reasons-Cover-letter-FINAL.pdf',
        id: '1',
        tag: 'finalDecisionAndReasonsPdf',
        dateUploaded: '2024-02-28'
      }
    ];

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: false,
      completed: true
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: true
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: true
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: true
    }];

    const appNextStep = {
      decision: 'allowed',
      descriptionParagraphs: [
        'A judge has <b> {{ applicationNextStep.decision }} </b> your appeal. <br>',
        '<p>The Decision and Reasons document includes the reasons the judge made this decision. You should read it carefully.</p><br> <a href={{ paths.common.decisionAndReasonsViewer }}>Read the Decision and Reasons document</a>'
      ],
      info: {
        title: 'Appeal Information',
        text: 'If you disagree with this decision, you have until <span class="govuk-!-font-weight-bold">{{ applicationNextStep.deadline }}</span> to apply for permission to appeal to the Upper Tribunal.',
        url: '<a href="{{ paths.ftpa.ftpaApplication }}">Apply for permission to appeal to the Upper Tribunal</a>'
      },
      cta: {},
      allowedAskForMoreTime: false,
      deadline: '13 March 2024'
    };

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'PA/12345/2025',
      applicationNextStep: appNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: true,
      showAppealRequests: true,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: true,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: true
    });
  });

  it('getApplicationOverview should render application-overview.njk with options and IDAM name#1', async () => {
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

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: true,
      completed: false
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: false
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: false
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: false
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'appealNumber',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      showAppealRequests: false,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: false,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: false
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
    req.session.appeal.appealReferenceNumber = 'appealNumber';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: true,
      completed: false
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: false
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: false
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: false
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'appealNumber',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      showAppealRequests: false,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: false,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: false
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
    req.session.appeal.utAppealReferenceNumber = null;

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    const expectedNextStep = {
      descriptionParagraphs: [
        'You need to finish telling us about your appeal.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null,
      cta: { url: '/about-appeal' },
      allowedAskForMoreTime: false,
      deadline: null
    };

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: true,
      completed: false
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: false
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: false
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: false
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Alex Developer',
      appealRefNumber: 'RP/50004/2020',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      showAppealRequests: false,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: false,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: false
    });
  });

  it('should render with only showAskForFeeRemission property', async function() {
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
    req.session.appeal.paymentStatus = 'Paid';

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledOnce;
    expect(res.render).to.have.been.calledWith('application-overview.njk', sinon.match.has('showAskForFeeRemission', true));
  });

  it('getApplicationOverview should render with appealRefNumber application-overview.njk with options and entered name', async () => {
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
      descriptionParagraphs: [
        'You need to finish telling us about your appeal.',
        'You will need to have your Home Office decision letter with you to answer some questions.'
      ],
      info: null,
      cta: { url: '/about-appeal' },
      allowedAskForMoreTime: false,
      deadline: null
    };

    const expectedStages = [{
      title: 'Your appeal<br/> details',
      ariaLabel: 'Your appeal details stage',
      active: true,
      completed: false
    }, {
      title: 'Your appeal<br/> argument',
      ariaLabel: 'Your appeal argument stage',
      active: false,
      completed: false
    }, {
      title: 'Your hearing<br/> details',
      ariaLabel: 'Your hearing details stage',
      active: false,
      completed: false
    }, {
      title: 'Your appeal<br/> decision',
      ariaLabel: 'Your appeal decision stage',
      active: false,
      completed: false
    }];

    expect(res.render).to.have.been.calledOnce.calledWith('application-overview.njk', {
      name: 'Appellant Name',
      appealRefNumber: 'RP/50004/2020',
      applicationNextStep: expectedNextStep,
      history: expectedHistory,
      stages: expectedStages,
      saved: false,
      ended: false,
      transferredToUt: false,
      askForMoreTimeInFlight: false,
      askForMoreTime: false,
      saveAndAskForMoreTime: false,
      provideMoreEvidenceSection: false,
      showAppealRequests: false,
      showAppealRequestsInAppealEndedStatus: false,
      showHearingRequests: false,
      showPayLaterLink: false,
      ftpaFeatureEnabled: true,
      hearingDetails: null,
      showChangeRepresentation: false,
      showFtpaApplicationLink: false,
      showAskForFeeRemission: false,
      showAskForSomethingInEndedState: false,
      isPostDecisionState: false
    });
  });

  it('should render showAskForSomethingInEndedState property when the state in ended', async () => {
    req.idam = {
      userDetails: {
        uid: 'user-id',
        name: 'Alex Developer',
        given_name: 'Alex',
        family_name: 'Developer',
        sub: 'email@test.com'
      }
    };
    req.session.appeal.appealStatus = 'ended';
    req.session.appeal.application.homeOfficeRefNumber = 'A1234567';
    req.session.appeal.appealReferenceNumber = 'RP/50004/2020';
    req.session.appeal.application.personalDetails.givenNames = 'Appellant';
    req.session.appeal.application.personalDetails.familyName = 'Name';
    req.session.appeal.hearing = {
      hearingCentre: 'taylorHouse',
      date: '2024-04-09T20:30:00.000',
      time: '240'
    };

    await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledOnce;
    expect(res.render).to.have.been.calledWith('application-overview.njk', sinon.match.has('showAskForSomethingInEndedState', true));
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

  it('checkEnableProvideMoreEvidenceSection should return true when in preHearing state and featureFlag enabled', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: States.PRE_HEARING.id
        }
      }
    };
    const featureFlagEnabled = true;
    const { appealStatus } = req.session.appeal;
    const result = checkEnableProvideMoreEvidenceSection(appealStatus, featureFlagEnabled);
    expect(result).to.equal(true);
  });

  it('checkEnableProvideMoreEvidenceSection should return false when in preHearing state and featureFlag not enabled', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: States.PRE_HEARING.id
        }
      }
    };
    const featureFlagEnabled = false;
    const { appealStatus } = req.session.appeal;
    const result = checkEnableProvideMoreEvidenceSection(appealStatus, featureFlagEnabled);
    expect(result).to.equal(false);
  });

  it('checkEnableProvideMoreEvidenceSection should return true when in respondentReview state', () => {
    const req = {
      session: {
        appeal: {
          appealStatus: States.RESPONDENT_REVIEW.id
        }
      }
    };
    const featureFlagEnabled = false;
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

  it('showAppealRequests should return true when in appealSubmitted state', () => {
    const result = showAppealRequestSection(States.APPEAL_SUBMITTED.id, true);
    expect(result).to.equal(true);
  });

  it('showAppealRequests should return false when in ended state', () => {
    const result = showAppealRequestSection(States.ENDED.id, true);
    expect(result).to.equal(false);
  });

  it('showHearingRequests should return false when in appealSubmitted state', () => {
    const result = showHearingRequestSection(States.APPEAL_SUBMITTED.id, true);
    expect(result).to.equal(false);
  });

  it('showHearingRequests should return true when in prepareForHearing state', () => {
    const result = showHearingRequestSection(States.PREPARE_FOR_HEARING.id, true);
    expect(result).to.equal(true);
  });

  it('showAppealRequestsInAppealEndedStatus should return true when in ended state', () => {
    const result = showAppealRequestSectionInAppealEndedStatus(States.ENDED.id, true);
    expect(result).to.equal(true);
  });

  it('isPostDecisionState should return true when in decided state', () => {
    const result = isPostDecisionState(States.DECIDED.id, true);
    expect(result).to.equal(true);
  });

  it('isPostDecisionState should return true when in ftpaDecided state', () => {
    const result = isPostDecisionState(States.FTPA_DECIDED.id, true);
    expect(result).to.equal(true);
  });

  it('isPostDecisionState should return true when in ftpaSubmitted state', () => {
    const result = isPostDecisionState(States.FTPA_SUBMITTED.id, true);
    expect(result).to.equal(true);
  });

  it('isPostDecisionState should return false when in state other than decided, ftpaDecided or ftpaSubmitted', () => {
    const result = isPostDecisionState(States.APPEAL_SUBMITTED.id, true);
    expect(result).to.equal(false);
  });

  it('showFtpaApplicationLink should return false when appellant ftpa appeal is submitted', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_SUBMITTED.id,
      ftpaAppellantApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(false);
  });

  it('showFtpaApplicationLink should return false when appellant ftpa appeal is decided', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_DECIDED.id,
      ftpaAppellantApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(false);
  });

  it('showFtpaApplicationLink should return true when respondent ftpa appeal is submitted', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_SUBMITTED.id,
      ftpaRespondentApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(true);
  });

  it('showFtpaApplicationLink should return true when respondent ftpa appeal is decided', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_DECIDED.id,
      ftpaRespondentApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(true);
  });

  it('showFtpaApplicationLink should return false before ftpa submitted state', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.DECIDED.id
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(false);
  });

  it('getAppealRefNumber should return null for DRAFT reference', () => {
    const result = getAppealRefNumber('DRAFT');
    expect(result).to.be.null;
  });

  it('getAppealRefNumber should return the appeal reference number', () => {
    const result = getAppealRefNumber('PA12345');
    expect(result).to.equal('PA12345');
  });

  it('checkAppealEnded should return true for ENDED status', () => {
    const result = checkAppealEnded('ENDED');
    expect(result).to.be.true;
  });

  it('checkAppealEnded should return false for non-ENDED status', () => {
    const result = checkAppealEnded('SUBMITTED');
    expect(result).to.be.false;
  });

  it('getAppellantName should return name from session appeal details', () => {
    req.session.appeal.application.personalDetails.givenNames = 'John';
    req.session.appeal.application.personalDetails.familyName = 'Doe';
    const result = getAppellantName(req);
    expect(result).to.equal('John Doe');
  });

  it('getAppellantName should return name from idam userDetails', () => {
    req.idam.userDetails.name = 'ATest User';
    const result = getAppellantName(req);
    expect(result).to.equal('ATest User');
  });

  it('getHearingDetails should return null if no hearing details', () => {
    const result = getHearingDetails(req);
    expect(result).to.be.null;
  });

  it('getHearingDetails should return hearing details if present', () => {
    req.session.appeal['hearing'] = { date: '2022-10-10' };
    const result = getHearingDetails(req);
    expect(result).to.deep.equal({
      hearingCentre: '',
      time: '12:00 am',
      date: '10 October 2022'
    });
  });

  it('checkEnableProvideMoreEvidenceSection should return true if state is pre-addendum and feature is enabled', () => {
    const result = checkEnableProvideMoreEvidenceSection(States.RESPONDENT_REVIEW.id, true);
    expect(result).to.be.true;
  });

  it('checkEnableProvideMoreEvidenceSection should return false if state is not in list and feature is not enabled', () => {
    const result = checkEnableProvideMoreEvidenceSection(States.AWAITING_RESPONDENT_EVIDENCE.id, false);
    expect(result).to.be.false;
  });

  it('showAppealRequestSection should return true if feature enabled and state is in list', () => {
    const result = showAppealRequestSection(States.APPEAL_SUBMITTED.id, true);
    expect(result).to.be.true;
  });

  it('showAppealRequestSection should return false if feature not enabled', () => {
    const result = showAppealRequestSection(States.APPEAL_SUBMITTED.id, false);
    expect(result).to.be.false;
  });

  it('showAppealRequestSectionInAppealEndedStatus should return true if feature enabled and appeal ended', () => {
    const result = showAppealRequestSectionInAppealEndedStatus(States.ENDED.id, true);
    expect(result).to.be.true;
  });

  it('showAppealRequestSectionInAppealEndedStatus should return false if feature not enabled', () => {
    const result = showAppealRequestSectionInAppealEndedStatus(States.ENDED.id, false);
    expect(result).to.be.false;
  });

  it('showHearingRequestSection should return true if feature enabled and state is in list', () => {
    const result = showHearingRequestSection(States.PREPARE_FOR_HEARING.id, true);
    expect(result).to.be.true;
  });

  it('showHearingRequestSection should return false if feature not enabled', () => {
    const result = showHearingRequestSection(States.PREPARE_FOR_HEARING.id, false);
    expect(result).to.be.false;
  });

  it('isAppealInProgress should return true if appeal is in progress', () => {
    const result = isAppealInProgress(States.APPEAL_SUBMITTED.id);
    expect(result).to.be.true;
  });

  it('isAppealInProgress should return false if appeal is not in progress', () => {
    const result = isAppealInProgress(States.APPEAL_STARTED.id);
    expect(result).to.be.false;
  });

  it('showFtpaApplicationLink should return false when appellant ftpa appeal is submitted', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_SUBMITTED.id,
      ftpaAppellantApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(false);
  });

  it('showFtpaApplicationLink should return false when appellant ftpa appeal is decided', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_DECIDED.id,
      ftpaAppellantApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(false);
  });

  it('showFtpaApplicationLink should return true when respondent ftpa appeal is submitted', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_SUBMITTED.id,
      ftpaRespondentApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(true);
  });

  it('showFtpaApplicationLink should return true when respondent ftpa appeal is decided', () => {
    const appeal = {
      ...req.session.appeal,
      appealStatus: States.FTPA_DECIDED.id,
      ftpaRespondentApplicationDate: '2020-01-01'
    };
    const result = showFtpaApplicationLink(appeal, true);
    expect(result).to.equal(true);
  });

  describe('getApplicationOverview with DLRM refund enabled paymentLink', function () {
    const tests = [
      { args: 'approved', expected: false },
      { args: 'partiallyApproved', expected: false },
      { args: 'rejected', expected: true }
    ];

    tests.forEach(({ args, expected }) => {
      it(`getApplicationOverview with DLRM refund enabled and remissionOption ${args} should render application-overview.njk with option showPayLaterLink ${expected}`, async function () {
        const recordRemissionEvent = [{
          'id': 'recordRemissionDecision',
          'createdDate': '2024-03-07T15:36:26.099'
        } as HistoryEvent];
        mockCcdService = {
          getCaseHistory: sandbox.stub().returns(recordRemissionEvent)
        } as Partial<CcdService>;

        updateAppealService = {
          getAuthenticationService: sandbox.stub().returns(mockAuthenticationService),
          getCcdService: sandbox.stub().returns(mockCcdService)
        };

        req.session.appeal.appealStatus = 'appealSubmitted';
        req.session.appeal.application.homeOfficeRefNumber = 'A1234567';
        req.session.appeal.appealReferenceNumber = 'RP/50004/2020';
        req.session.appeal.application.personalDetails.givenNames = 'Appellant';
        req.session.appeal.application.personalDetails.familyName = 'Name';
        req.session.appeal.application.appealType = 'protection';
        req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
        req.session.appeal.application.remissionOption = 'feeWaiverFromHo';
        req.session.appeal.application.remissionDecision = args;

        await getApplicationOverview(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

        const stubRender = res.render as SinonStub;
        expect(stubRender.getCall(0).args[0]).to.equal('application-overview.njk');
        expect(stubRender.getCall(0).args[1].showPayLaterLink).to.equal(expected);
      });
    });
  });
});
