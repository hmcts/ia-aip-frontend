import { paths } from '../paths';
import { setupSecrets } from '../setupSecrets';
import Logger from '../utils/logger';

const config = setupSecrets();
const loginUrl = `${config.get('idam.webUrl')}/login`;

export const idamConfig = {
  redirectUri: 'https://localhost:3000/redirectUrl',
  indexUrl: paths.common.login,
  idamApiUrl: config.get('idam.apiUrl'),
  idamLoginUrl: loginUrl,
  idamUserLoginUrl: loginUrl,
  idamRegistrationUrl: `${config.get('idam.webUrl')}/users/selfRegister`,
  idamSecret: config.get('idam.secret'),
  idamClientID: config.get('microservice'),
  openId: false,
  logger: null
};

export function setupIdamConfig(logger: Logger) {
  idamConfig.logger = logger;
}
