const getServiceAuth = (args = {}) => {
  if (!args.idamClientID || !args.idamSecret) {
    throw new Error('ClientID or Secret is undefined');
  }

  return Buffer.from(`${args.idamClientID}:${args.idamSecret}`).toString('base64');
};

module.exports = getServiceAuth;
