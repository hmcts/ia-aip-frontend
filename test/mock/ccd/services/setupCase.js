const cache = require('memory-cache');
const querystring = require('node:querystring');

module.exports = {
  path: '/setupCase',
  method: 'POST',
  template: (params, query, body) => {
    const queryObject = JSON.parse(JSON.stringify(querystring.parse(query)));
    cache.put(`caseData${queryObject.uid}`, body);
    return body;
  }
};
