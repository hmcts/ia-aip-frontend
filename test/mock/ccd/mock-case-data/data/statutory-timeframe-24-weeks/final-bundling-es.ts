import appealSubmittedCaseDataSTF24WES from './appeal-submitted-es';

export default {
  'total': 1,
  cases: [
    {
      ...appealSubmittedCaseDataSTF24WES.cases[0],
      'id': 48,
      'state': 'finalBundling',
      'case_data': {
        ...appealSubmittedCaseDataSTF24WES.cases[0].case_data,
        listCaseHearingDate: '2026-03-01T16:00:00',
        listCaseHearingCentre: 'taylorHouse'
      }
    }
  ]
};
