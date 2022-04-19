import { idamConfig } from '../../config/idam-config';

const getServiceAuth = function (args = {}) {
  if (!idamConfig.idamClientID || !idamConfig.idamSecret) {
    throw new Error('ClientID or Secret is undefined');
  }

  return Buffer.from(`${idamConfig.idamClientID}:${idamConfig.idamSecret}`).toString('base64');
};

module.exports = getServiceAuth;
