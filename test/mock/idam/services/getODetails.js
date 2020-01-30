const cache = require('memory-cache');

const defaultUserId = '1';
const emailToUserId = {
  'no-cases@example.com' : '1',
  'has-case@example.com': '2',
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
