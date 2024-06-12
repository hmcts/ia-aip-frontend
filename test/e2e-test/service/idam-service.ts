import moment from 'moment';
import { asBooleanValue } from '../../../app/utils/utils';

const rp = require('request-promise');
const config = require('config');

const idamUrl = config.get('idam.apiUrl');
const idamClientSecret = config.get('idam.secret');
const microservice = config.get('microservice');

const proxyUrl = config.get('proxy.host');
const proxyPort = config.get('proxy.port');
const redirectUrl = 'https://localhost:3000/redirectUrl';

const httpProxyEnabled = asBooleanValue(config.get('httpProxy'));

export let aipCurrentUser = { email: '', password: '', forename: '', surname: '' };
// tslint:disable:no-console
async function createUser() {
  console.info('======================');
  console.info('Creating User');
  console.info('======================');
  const randomNumber = moment().format().replace(/-/g,'').replace('T','').replace(/:/g,'').split('+')[0];
  aipCurrentUser.email = `ia_citizen${randomNumber}@hmcts.net`;
  aipCurrentUser.password = 'Apassword123';
  aipCurrentUser.forename = 'ATestForename';
  aipCurrentUser.surname = 'ATestSurname';
  const options = {
    url: `${idamUrl}/testing-support/accounts`,
    json: true,
    body: {
      email: aipCurrentUser.email,
      forename: aipCurrentUser.forename,
      id: randomNumber,
      password: aipCurrentUser.password,
      roles: [
        {
          code: 'citizen'
        }
      ],
      surname: aipCurrentUser.surname,
      userGroup: {
        code: 'citizen'
      }
    },
    insecure: true,
    timeout: 10000,
    resolveWithFullResponse: true
  };
  try {
    let response = null;
    if (httpProxyEnabled) {
      const proxy = `http://${proxyUrl}:${proxyPort}`;
      const proxiedRequest = rp.defaults({ 'proxy': proxy });
      response = await proxiedRequest.post(options);
    } else {
      response = await rp.post(options);
    }
    return aipCurrentUser;
  } catch (error) {
    console.log(`Error createUser ${error.message}`);
  }
}

async function getUserToken(userConfig) {
  console.info('======================');
  console.info('Retrieving User Token');
  console.info('======================');
  let authResponse = null;

  const authOptions = {
    uri: `${idamUrl}/oauth2/authorize`,
    json: true,
    headers: {
      'Accept': 'application/json'
    },
    auth: {
      user: userConfig.email,
      pass: userConfig.password
    },
    form: {
      response_type: 'code',
      client_id: microservice,
      redirect_uri: redirectUrl
    }
  };

  console.info('->', 'Obtaining IDAM authorization code');
  if (httpProxyEnabled) {
    const proxy = `http://${proxyUrl}:${proxyPort}`;
    const proxiedRequest = rp.defaults({ 'proxy': proxy });
    authResponse = await proxiedRequest.post(authOptions);
  } else {
    authResponse = await rp.post(authOptions);
  }

  let tokenResponse = null;
  const tokenOptions = {
    uri: `${idamUrl}/oauth2/token`,
    json: true,
    form: {
      code: authResponse.code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUrl,
      client_id: microservice,
      client_secret: idamClientSecret
    }
  };
  console.info('->', 'Obtaining IDAM user token');
  if (httpProxyEnabled) {
    const proxy = `http://${proxyUrl}:${proxyPort}`;
    const proxiedRequest = rp.defaults({ 'proxy': proxy });
    tokenResponse = await proxiedRequest.post(tokenOptions);
  } else {
    tokenResponse = await rp.post(tokenOptions);
  }

  return 'Bearer ' + tokenResponse.access_token;
}

async function getUserId(userToken: string) {
  const userDetails = await rp.get({
    url: `${idamUrl}/details`,
    json: true,
    headers: {
      'Authorization': userToken
    }
  });

  return userDetails.id;
}

export {
  createUser,
  getUserToken,
  getUserId
};
