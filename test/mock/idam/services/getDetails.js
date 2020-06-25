const cache = require('memory-cache');

const defaultUserId = '1';
const emailToUserId = {
  'no-cases@example.com' : '1',
  'has-case@example.com': '2',
  'appeal-submitted@example.com': '3',
  'awaiting-reasons-for-appeal@example.com': '4',
  'partial-awaiting-reasons-for-appeal@example.com': '5',
  'awaitingReasonsForAppeal-with-time_extension@example.com': '7',
  'awaitingClarifyingQuestions-with-time_extension@example.com': '8',
  'awaitingCmaRequirements@example.com': '9',
  'awaitingCmaRequirements-with-time_extension@example.com': '10',
  'setupcase@example.com': '999'
};

module.exports = {
  path: '/details',
  method: 'GET',
  template: {
    uid: () => emailToUserId[cache.get('email')] || defaultUserId,
    email: () => cache.get('email'),
    forename: 'John',
    surname: 'Smith'
  },
  cache: false
};
