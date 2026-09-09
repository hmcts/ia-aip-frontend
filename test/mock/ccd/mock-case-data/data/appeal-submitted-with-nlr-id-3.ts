import appealSubmittedCaseData from './appeal-submitted-with-nlr-id';

export default {
  ...appealSubmittedCaseData,
  'id': 63,
  'case_data': {
    ...appealSubmittedCaseData.case_data,
    nlrDetails: {
      ...appealSubmittedCaseData.case_data.nlrDetails,
      idamId: '63'
    }
  }
};
