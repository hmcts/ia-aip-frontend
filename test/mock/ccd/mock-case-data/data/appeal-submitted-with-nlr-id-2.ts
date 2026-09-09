import appealSubmittedCaseData from './appeal-submitted-with-nlr-id';

export default {
  ...appealSubmittedCaseData,
  'id': 62,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    nlrDetails: {
      ...appealSubmittedCaseData.case_data.nlrDetails,
      idamId: '62'
    }
  }
};
