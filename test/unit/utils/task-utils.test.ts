import { appealApplicationStatus } from '../../../app/utils/tasks-utils';
import { expect } from '../../utils/testUtils';

describe('getStatus', () => {

  const appeal: Appeal = {
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
          saved: false,
          completed: false,
          active: false
        },
        personalDetails: {
          saved: true,
          completed: false,
          active: false
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
  };

  const status = {
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
  };

  it('should update status in session', () => {
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status homeOfficeDetails as completed and mark active next task', () => {
    appeal.application.isAppealLate = false;
    status.homeOfficeDetails.completed = true;
    status.personalDetails.active = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
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
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
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
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
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
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
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
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });
});
