import appealSubmittedCaseDataSTF24W from './appeal-submitted';

export default {
  ...appealSubmittedCaseDataSTF24W,
  'id': 49,
  'state': 'pendingPayment',
  'case_data': {
    ...appealSubmittedCaseDataSTF24W.case_data,
    'remissionDecision': 'approved',
  }

};
