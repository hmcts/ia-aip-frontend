import { isJWTExpired } from '../../../app/utils/jwt-utils';
import Logger, { getLogLabel } from '../../../app/utils/logger';

const axios = require('axios');
const config = require('config');

const idamTestingSupportUrl = config.get('idam.testingSupportUrl');
const idamUrl = config.get('idam.apiUrl');
const idamWebUrl = config.get('idam.webUrl');
const idamSecret = config.get('idam.secret');
const idamClientSecret = config.get('idam.rpxClientSecret');
const testUrl = config.get('testUrl');

const redirectUrl = `${testUrl}/redirectUrl`;

const workerThreads = require('node:worker_threads');
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

type UserInfo = {
  email: string;
  password: string;
  forename?: string;
  surname?: string;
  userId?: string;
  userToken?: string;
  caseId?: string;
};

let idamTestingAccessToken;

async function setTestingSupportToken() {
  try {
    const response = await axios.post(`${idamWebUrl}/o/token`, new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'iac',
      client_secret: idamSecret,
      scope: 'profile roles'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    idamTestingAccessToken = response.data.access_token;
  } catch (error) {
    logger.exception(`Error in setTestingSupportToken: ${error.message}`, logLabel);
  }
}

async function createUser(userInfo: UserInfo) {
  if (idamTestingAccessToken === undefined) {
    await setTestingSupportToken();
  }
  const timestamp = Date.now();
  userInfo.email = userInfo.email.replace('@', `${timestamp}@`);
  try {
    await axios.post(`${idamTestingSupportUrl}/test/idam/users`, {
      password: userInfo.password,
      user: {
        email: userInfo.email,
        forename: userInfo.forename,
        surname: userInfo.surname,
        roleNames: ['citizen']
      }
    }, {
      headers: {
        'Authorization': `Bearer ${idamTestingAccessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    userInfo.userToken = await getUserToken(userInfo);
    userInfo.userId = await getUserId(userInfo.userToken);
    logger.traceWorker(`Creating user: ${userInfo.email}`, logLabel);
  } catch (error) {
    logger.exception(`Error in createUser: ${error.message}`, logLabel);
  }
}

async function deleteUser(userInfo: UserInfo) {
  logger.traceWorker(`Deleting user: ${userInfo.email}`, logLabel);
  try {
    await axios.delete(`${idamTestingSupportUrl}/test/idam/users/${userInfo.userId}`, {
      headers: {
        Authorization: `Bearer ${idamTestingAccessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.exception(`Error in deleteUser: ${error.message}`, logLabel);
  }
  delete userInfo.userId;
  delete userInfo.userToken;
  delete userInfo.caseId;
  userInfo.email = userInfo.email.replace(/\d+/g, '');
}

async function getUserToken(userConfig: UserInfo) {
  if (userConfig.userToken && !isJWTExpired(userConfig.userToken)) {
    return userConfig.userToken;
  }
  try {
    const response = await axios.post(
      `${idamUrl}/o/token`, '',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {
          grant_type: 'password',
          redirect_uri: redirectUrl,
          client_id: 'xuiwebapp',
          client_secret: idamClientSecret,
          username: userConfig.email,
          password: userConfig.password,
          scope: 'profile openid roles manage-user create-user search-user'
        }
      }
    );
    return `Bearer ${response.data.access_token}`;
  } catch (error) {
    logger.exception(`Error in getUserToken: ${error.message}`, logLabel);
  }
}

async function getUserId(userToken: string) {
  try {
    const userDetails = await axios.get(`${idamUrl}/details`, {
      headers: {
        'Authorization': userToken
      }
    });
    return userDetails.data.id;
  } catch (error) {
    logger.exception(`Error in getUserId: ${error.message}`, logLabel);
  }
}

async function deleteCitizenUser(): Promise<void> {
  const user: UserInfo = getCitizenUserFromThread();
  if (user.userId) {
    await deleteUser(user);
  }
}

async function createCitizenUser(): Promise<void> {
  const user: UserInfo = getCitizenUserFromThread();
  if (!user.userId) {
    await createUser(user);
  }
}

function getCitizenUserFromThread(): UserInfo {
  return functionalUsers()[workerThreads.threadId - 1];
}

function functionalUsers(): UserInfo[] {
  return [
    citizenUser1,
    citizenUser2,
    citizenUser3,
    citizenUser4,
    citizenUser5
  ];
}

const citizenUser1: UserInfo = {
  email: 'citizen1@example.com',
  password: 'Apassword123',
  forename: 'worker1',
  surname: 'functionalCase'
};

const citizenUser2: UserInfo = {
  email: 'citizen2@example.com',
  password: 'Apassword123',
  forename: 'worker2',
  surname: 'functionalCase'
};

const citizenUser3: UserInfo = {
  email: 'citizen3@example.com',
  password: 'Apassword123',
  forename: 'worker3',
  surname: 'functionalCase'
};

const citizenUser4: UserInfo = {
  email: 'citizen4@example.com',
  password: 'Apassword123',
  forename: 'worker4',
  surname: 'functionalCase'
};

const citizenUser5: UserInfo = {
  email: 'citizen5@example.com',
  password: 'Apassword123',
  forename: 'worker5',
  surname: 'functionalCase'
};

export {
  setTestingSupportToken,
  getUserToken,
  getUserId,
  functionalUsers,
  UserInfo,
  createUser,
  deleteUser,
  deleteCitizenUser,
  createCitizenUser,
  getCitizenUserFromThread
};
