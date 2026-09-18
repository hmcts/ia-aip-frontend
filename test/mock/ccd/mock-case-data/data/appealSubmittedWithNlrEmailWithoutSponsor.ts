import appealSubmittedCaseData from './appeal-submitted';

export default {
  ...appealSubmittedCaseData,
  'id': 53,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    hasNonLegalRep: 'Yes',
    hasSponsor: 'No',
    nlrDetails: {
      emailAddress: 'test@test.com'
    },
    'subscriptions': [{
      'id': 'ce208f30-0aae-41a1-95a6-8b79333fa274',
      'value': { 'email': 'citizen@test.com', 'wantsSms': 'Yes', 'mobileNumber': '07899999999', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    }],
  }
};
