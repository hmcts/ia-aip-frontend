import caseData from './submit-hearing-requirements-access-needs-complete';

export default {
  ...caseData,
  'id': 70,
  'case_data': {
    ...caseData.case_data,
    nlrDetails: {
      ...caseData.case_data.nlrDetails,
      idamId: null
    }
  }
};
