import appealSubmittedCaseData from './appeal-submitted';

export default {
  ...appealSubmittedCaseData,
  'id': 57,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    hasNonLegalRep: 'Yes',
    hasSponsor: 'No',
    appealReferenceNumber: 'PA/12345/2026',
    nlrDetails: {
      emailAddress: 'test@test.com',
      givenNames: 'John',
      familyName: 'Doe',
      address: 'some address',
      phoneNumber: '1234567890',
      idamId: '57'
    }
  }
};
