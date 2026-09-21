import appealSubmittedCaseData from './appealSubmittedWithNlrEmailWithoutSponsor';

export default {
  ...appealSubmittedCaseData,
  'id': 54,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    hasSponsor: 'Yes'
  }
};
