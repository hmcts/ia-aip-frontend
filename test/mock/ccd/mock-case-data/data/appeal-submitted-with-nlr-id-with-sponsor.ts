import appealSubmittedCaseData from './appeal-submitted';

export default {
  ...appealSubmittedCaseData,
  'id': 59,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    hasNonLegalRep: 'Yes',
    hasSponsor: 'Yes',
    appealReferenceNumber: 'PA/12345/2026',
    'subscriptions': [{
      'id': 'ce208f30-0aae-41a1-95a6-8b79333fa274',
      'value': { 'email': 'citizen@test.com', 'mobileNumber': '07899999999', 'wantsSms': 'Yes', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    }],
    nlrDetails: {
      emailAddress: 'test@test.com',
      givenNames: 'John',
      familyName: 'Doe',
      address: 'some address',
      phoneNumber: '07827297000',
      idamId: '59'
    }
  }
};
