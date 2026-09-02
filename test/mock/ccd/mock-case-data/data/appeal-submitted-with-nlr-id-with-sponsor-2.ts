import appealSubmittedCaseData from './appeal-submitted-with-nlr-id-with-sponsor';

export default {
  ...appealSubmittedCaseData,
  'id': 61,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    nlrDetails: {
      ...appealSubmittedCaseData.case_data.nlrDetails,
      idamId: '61'
    }
  }
};
