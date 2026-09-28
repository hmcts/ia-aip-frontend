import caseData from './submit-hearing-requirements-access-needs-complete';

export default {
  ...caseData,
  'id': 69,
  'case_data': {
    ...caseData.case_data,
    nlrAttending: 'Yes'
  }
};
