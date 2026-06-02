import appealSubmittedCaseDataSTF24W from './appeal-submitted';

export default {
  ...appealSubmittedCaseDataSTF24W,
  'id': 48,
  'state': 'finalBundling',
  'case_data': {
    ...appealSubmittedCaseDataSTF24W.case_data,
    listCaseHearingDate: '2026-03-01T16:00:00',
    listCaseHearingCentre: 'taylorHouse'
  }

};
