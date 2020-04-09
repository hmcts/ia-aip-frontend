import { paths } from '../paths';
import { setupSecrets } from '../setupSecrets';

const config = setupSecrets();
const loginUrl = `${config.get('idam.webUrl')}/login`;

export const idamConfig = {
  redirectUri: 'https://localhost:3000/redirectUrl',
  indexUrl: paths.login,
  idamApiUrl: config.get('idam.apiUrl'),
  idamLoginUrl: loginUrl,
  idamUserLoginUrl: loginUrl,
  idamRegistrationUrl: `${config.get('idam.webUrl')}/users/selfRegister`,
  idamSecret: config.get('idam.secret'),
  idamClientID: config.get('microservice'),
  openId: true
};
