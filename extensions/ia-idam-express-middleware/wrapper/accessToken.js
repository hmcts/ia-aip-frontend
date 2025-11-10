const request = require('request-promise-native');

const requestDefaults = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  json: true
};
const formDefaults = { grant_type: 'authorization_code' };

const accessToken = (options = {}, args) => {
  let requestOptions = {};
  if (args.openId) {
    const clientFormData = {
      client_id: args.idamClientID,
      client_secret: args.idamSecret
    };
    requestOptions = Object.assign({
      uri: `${args.idamApiUrl}/o/token`,
      form: Object.assign({}, formDefaults, options, clientFormData)
    }, requestDefaults);
  } else {
    requestOptions = Object.assign({
      uri: `${args.idamApiUrl}/oauth2/token`,
      form: Object.assign({}, formDefaults, options),
      auth: {
        user: args.idamClientID,
        pass: args.idamSecret
      }
    }, requestDefaults);
  }

  return request.post(requestOptions);
};

module.exports = accessToken;
