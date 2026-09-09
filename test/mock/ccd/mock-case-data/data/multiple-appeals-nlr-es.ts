import { multipleAppealCase1001, multipleAppealCase1002, multipleAppealCase1003 } from './multiple-appeals';

const multipleAppealNlrCase1002 = {
  ...multipleAppealCase1002,
  'case_data': {
    ...multipleAppealCase1002.case_data,
    'nlrDetails': {
      'idamId': '101'
    }
  }
};

export default {
  'total': 3,
  'cases': [multipleAppealCase1001, multipleAppealNlrCase1002, multipleAppealCase1003]
};
