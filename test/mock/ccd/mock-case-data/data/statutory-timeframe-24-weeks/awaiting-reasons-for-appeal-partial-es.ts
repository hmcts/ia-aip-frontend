import awaitingReasonsForAppealCaseDataSTF24WES from './awaiting-reasons-for-appeal-es';

export default {
  'total': 1,
  cases: [
    {
      ...awaitingReasonsForAppealCaseDataSTF24WES.cases[0],
      'id': 46,
      'case_data': {
        ...awaitingReasonsForAppealCaseDataSTF24WES.cases[0].case_data,
        'reasonsForAppealDecision': 'test'
      }
    }
  ]
};
