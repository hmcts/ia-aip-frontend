import config from 'config';

export const idamConfig = {
  redirectUri: 'https://localhost:3001/redirectUrl',
  indexUrl: '/start',
  idamApiUrl: config.get('idam.apiUrl'),
  idamLoginUrl: `${config.get('idam.webUrl')}/login`,
  idamSecret: config.get('idam.secret'),
  idamClientID: config.get('microservice')
};
