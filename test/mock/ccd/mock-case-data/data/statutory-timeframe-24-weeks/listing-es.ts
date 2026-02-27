import appealSubmittedCaseDataSTF24WES from './appeal-submitted-es';

export default {
  'total': 1,
  cases: [
    {
      ...appealSubmittedCaseDataSTF24WES.cases[0],
      "id": 40,
      state: 'listing'
    }
  ]
};
