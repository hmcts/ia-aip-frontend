import { IdamConfig } from '../../../../types';

const getServiceAuth = (args: IdamConfig = {}) => {
  if (!args.idamClientID || !args.idamSecret) {
    throw new Error('ClientID or Secret is undefined');
  }

  return Buffer.from(`${args.idamClientID}:${args.idamSecret}`).toString('base64');
};

export default getServiceAuth;
