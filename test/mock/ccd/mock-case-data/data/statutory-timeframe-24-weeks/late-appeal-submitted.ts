import data from './appeal-submitted';

export default {
  ...data,
  'id': 38,
  'case_data': {
    ...data.case_data,
    'submissionOutOfTime': 'Yes'
  }
};
