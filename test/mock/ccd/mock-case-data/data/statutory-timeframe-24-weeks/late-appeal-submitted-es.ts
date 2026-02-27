import appealSubmittedCaseDataSTF24WES from './appeal-submitted-es';

export default {
  'total': 1,
  cases: [
    {
      ...appealSubmittedCaseDataSTF24WES.cases[0],
      "id": 38,
      "case_data": {
        ...appealSubmittedCaseDataSTF24WES.cases[0].case_data,
        'submissionOutOfTime': 'Yes'
      }
    }
  ]
};
