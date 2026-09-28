import appealSubmittedCaseData from './appeal-submitted';

export default {
  ...appealSubmittedCaseData,
  'id': 56,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    hasNonLegalRep: 'Yes',
    hasSponsor: 'No',
    nlrDetails: {
      emailAddress: 'test@test.com',
      givenNames: 'John',
      familyName: 'Doe',
      address: 'some address',
      phoneNumber: '1234567890'
    }
  }
};
