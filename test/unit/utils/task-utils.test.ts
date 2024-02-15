import { NextFunction, Request, Response } from 'express';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import { appealApplicationStatus } from '../../../app/utils/tasks-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('getStatus', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let appeal: Appeal;
  let status;
  let statusWithDlrm;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          appealStatus: 'appealStarted',
          hearing: {
            hearingCentre: 'Taylor House',
            date: '21 April 2019',
            time: '10am'
          },
          application: {
            appellantOutOfCountryAddress: '',
            homeOfficeRefNumber: 'reference no',
            appellantInUk: 'No',
            outsideUkWhenApplicationMade: 'No',
            gwfReferenceNumber: '',
            dateClientLeaveUk: {
              year: '2022',
              month: '2',
              day: '19'
            },
            appealType: null,
            contactDetails: null,
            hasSponsor: null,
            sponsorGivenNames: 'Michael',
            sponsorFamilyName: 'Jackson',
            sponsorNameForDisplay: 'Michael Jackson',
            sponsorAddress: {
              line1: '39 The Street,',
              line2: '',
              city: 'Ashtead',
              county: 'United Kingdom',
              postcode: 'KT21 1AA'
            },
            sponsorContactDetails: null,
            sponsorAuthorisation: null,
            dateLetterSent: {
              day: '1',
              month: '1',
              year: '1980'
            },
            decisionLetterReceivedDate: {
              year: '2020',
              month: '2',
              day: '16'
            },
            isAppealLate: true,
            lateAppeal: null,
            personalDetails: {
              givenNames: 'given names',
              familyName: 'family name',
              dob: null,
              nationality: null
            },
            tasks: {
              typeOfAppeal: {
                saved: false,
                completed: false,
                active: true
              },
              homeOfficeDetails: {
                saved: true,
                completed: true,
                active: false
              },
              homeOfficeDetailsOOC: {
                saved: true,
                completed: true,
                active: false
              },
              personalDetails: {
                saved: true,
                completed: false,
                active: true
              },
              contactDetails: {
                saved: false,
                completed: false,
                active: false
              },
              decisionType: {
                active: false,
                completed: false,
                saved: false
              },
              checkAndSend: {
                saved: false,
                completed: false,
                active: false
              },
              checkAndSendWithPayments: {
                saved: false,
                completed: false,
                active: false
              }
            },
            addressLookup: {},
            homeOfficeLetter: [
              {
                fileId: 'fileId',
                name: 'filename'
              }
            ]
          },
          reasonsForAppeal: {
            applicationReason: null
          },
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

    appeal = req.session.appeal;
    status = req.session.appeal.application.tasks;
    statusWithDlrm = {
      typeOfAppeal: {
        saved: false,
        completed: false,
        active: true
      },
      homeOfficeDetails: {
        saved: true,
        completed: true,
        active: false
      },
      homeOfficeDetailsOOC: {
        saved: true,
        completed: true,
        active: false
      },
      personalDetails: {
        saved: true,
        completed: false,
        active: true
      },
      contactDetails: {
        saved: false,
        completed: false,
        active: false
      },
      decisionType: {
        active: false,
        completed: false,
        saved: false
      },
      feeSupport: {
        active: false,
        completed: false,
        saved: false
      },
      checkAndSendDlrmSetAsideFlag: {
        saved: false,
        completed: false,
        active: false
      },
      checkAndSendWithPaymentsDlrmSetAsideFlag: {
        saved: false,
        completed: false,
        active: false
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should update status in session', () => {
    expect(appealApplicationStatus(appeal, false)).to.deep.eq(status);
  });

  it('should update status in session with DLRM flag ON', () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);
    expect(appealApplicationStatus(appeal, true)).to.deep.eq(statusWithDlrm);
  });

  it('should update status homeOfficeDetails as completed and mark active next task', () => {
    appeal.application.isAppealLate = false;
    status.homeOfficeDetails.completed = true;
    status.personalDetails.active = true;
    expect(appealApplicationStatus(appeal, false)).to.deep.eq(status);
  });

  it('should update status personalDetails as completed and mark active next task', () => {
    appeal.application.personalDetails.dob = {
      day: '1',
      month: '1',
      year: '1980'
    };
    appeal.application.personalDetails = {
      ...appeal.application.personalDetails,
      nationality: 'Angola',
      address: {
        line1: '60 GPS London United Kingdom  W1W 7RT60 GPS London United Kingdom  W1W 7RT',
        postcode: 'W1W 7RT'
      }
    } as any;
    status.personalDetails.completed = true;
    status.contactDetails.active = true;
    expect(appealApplicationStatus(appeal, false)).to.deep.eq(status);
  });

  it('should update status contactDetails as completed and mark active next task', () => {
    appeal.application.contactDetails = {
      ...appeal.application.contactDetails,
      phone: '07769118762',
      wantsSms: true
    };
    appeal.application.hasSponsor = 'No';
    status.contactDetails = {
      ...status.contactDetails,
      completed: true,
      saved: true
    };
    status.decisionType.active = true;
    expect(appealApplicationStatus(appeal, false)).to.deep.eq(status);
  });

  it('should update status contactDetails as completed', () => {
    appeal.application.contactDetails = {
      ...appeal.application.contactDetails,
      phone: undefined,
      wantsSms: false,
      email: 'email@test.com',
      wantsEmail: true
    };
    appeal.application.hasSponsor = 'No';
    status.contactDetails = {
      ...status.contactDetails,
      completed: true,
      saved: true
    };
    status.decisionType.active = true;
    expect(appealApplicationStatus(appeal, false)).to.deep.eq(status);
  });

  it('should update status typeOfAppeal as completed', () => {
    appeal.application.appealType = 'protection';
    status.typeOfAppeal = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    status.homeOfficeDetails.active = true;
    status.homeOfficeDetailsOOC.active = true;
    expect(appealApplicationStatus(appeal, false)).to.deep.eq(status);
  });

  it('should update status typeOfAppeal as completed with DLRM flag ON', () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

    appeal.application.appealType = 'protection';
    statusWithDlrm.typeOfAppeal = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    statusWithDlrm.homeOfficeDetails.active = true;
    statusWithDlrm.homeOfficeDetailsOOC.active = true;
    expect(appealApplicationStatus(appeal, true)).to.deep.eq(statusWithDlrm);
  });

  it('should update status feeSupport as active with DLRM flag ON', () => {
    sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false).resolves(true);

    appeal.application.appealType = 'protection';
    appeal.paAppealTypeAipPaymentOption = 'payNow';
    appeal.application.decisionHearingFeeOption = 'decisionWithHearing';

    statusWithDlrm.typeOfAppeal = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    statusWithDlrm.decisionType = {
      ...status.decisionType,
      completed: true,
      saved: true
    };
    statusWithDlrm.feeSupport = {
      ...status.feeSupport,
      saved: false,
      completed: false,
      active: true
    };

    statusWithDlrm.homeOfficeDetails.active = true;
    statusWithDlrm.homeOfficeDetailsOOC.active = true;
    expect(appealApplicationStatus(appeal, true)).to.deep.eq(statusWithDlrm);
  });

});
