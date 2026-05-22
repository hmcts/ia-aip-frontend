import data from './awaiting-reasons-for-appeal';

export default {
  ...data,
  'id': 46,
  'case_data': {
    ...data.case_data,
    'reasonsForAppealDecision': 'test'
  }
};
