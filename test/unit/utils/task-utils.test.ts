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
      homeOfficeRefNumber: 'reference no',
      appellantInUk: 'No',
      appealType: null,
      contactDetails: null,
      dateLetterSent: {
        day: '1',
        month: '1',
        year: '1980'
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
    typeOfAppealAndDecision: {
      saved: false,
      completed: false,
      active: false
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
    status.contactDetails = {
      ...status.contactDetails,
      completed: true,
      saved: true
    };
    status.decisionType.active = true;
    status.typeOfAppealAndDecision.active = true;
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
    status.contactDetails = {
      ...status.contactDetails,
      completed: true,
      saved: true
    };
    status.typeOfAppeal.active = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status typeOfAppeal as completed', () => {
    appeal.application.appealType = 'protection';
    status.typeOfAppeal = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    status.typeOfAppealAndDecision = {
      ...status.typeOfAppeal,
      completed: false,
      saved: true
    };
    status.homeOfficeDetails.active = true;
    status.decisionType.saved = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status typeOfAppealAndDecision as completed', () => {
    appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
    status.typeOfAppealAndDecision = {
      ...status.typeOfAppeal,
      completed: false,
      saved: true
    };
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status typeOfAppealAndDecision as completed', () => {
    appeal.paAppealTypeAipPaymentOption = 'payLater';
    status.typeOfAppealAndDecision = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    status.checkAndSendWithPayments.active = true;
    status.checkAndSend.active = true;
    status.decisionType.completed = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status typeOfAppealAndDecision as completed', () => {
    appeal.application.appealType = 'refusalOfHumanRights';
    appeal.application.decisionHearingFeeOption = null;
    appeal.paAppealTypeAipPaymentOption = null;
    status.typeOfAppealAndDecision = {
      ...status.typeOfAppeal,
      completed: false,
      saved: true
    };
    status.checkAndSendWithPayments.active = false;
    status.checkAndSend.active = false;
    status.decisionType.completed = false;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });

  it('should update status typeOfAppealAndDecision as completed', () => {
    appeal.application.appealType = 'refusalOfHumanRights';
    appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
    appeal.paAppealTypeAipPaymentOption = null;
    status.typeOfAppealAndDecision = {
      ...status.typeOfAppeal,
      completed: true,
      saved: true
    };
    status.checkAndSendWithPayments.active = true;
    status.checkAndSend.active = true;
    status.decisionType.completed = true;
    expect(appealApplicationStatus(appeal)).to.deep.eq(status);
  });
});
