const cache = require('memory-cache');

const defaultUserId = '1';
const emailToUserId = {
  'no-cases@example.com' : '1',
  'has-case@example.com': '2',
  'appeal-submitted@example.com': '3',
  'awaiting-reasons-for-appeal@example.com': '4',
  'partial-awaiting-reasons-for-appeal@example.com': '5',
  'awaiting-reasons-for-appeal-with-time_extension@example.com': '6',
  'setupcase@example.com': '999'
};

module.exports = {
  path: '/o/userinfo',
  method: 'GET',
  template: {
    uid: () => emailToUserId[cache.get('email')] || defaultUserId,
    email: () => cache.get('email'),
    forename: 'John',
    surname: 'Smith'
  },
  cache: false
};
