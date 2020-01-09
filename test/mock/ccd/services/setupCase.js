const cache = require('memory-cache');

module.exports = {
  path: '/setupCase',
  method: 'POST',
  template: (params, query, body) => {
    cache.put('caseData', body);
    return body;
  }
};
