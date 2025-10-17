import { isJWTExpired } from '../../app/utils/jwt-utils';
import Logger, { getLogLabel } from '../../app/utils/logger';

const axios = require('axios');
const config = require('config');

const idamTestingSupportUrl = config.get('idam.testingSupportUrl');
const idamUrl = config.get('idam.apiUrl');
const idamWebUrl = config.get('idam.webUrl');
const idamSecret = config.get('idam.secret');
const idamClientSecret = config.get('idam.rpxClientSecret');
const microservice = config.get('microservice');
const testUrl = config.get('testUrl');

const redirectUrl = `${testUrl}/redirectUrl`;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

type AipUser = {
  email: string;
  password: string;
  forename: string;
  surname: string;
  userId?: string;
  userToken?: string;
  caseId?: string;
  caseData?: CaseData;
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

async function createUser(userInfo: AipUser) {
  logger.trace(`Creating user: ${userInfo.email}`, logLabel);
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
  } catch (error) {
    logger.exception(`Error in createUser: ${error.message}`, logLabel);
  }
}

async function deleteUser(userInfo: AipUser) {
  logger.trace(`Deleting user: ${userInfo.email}`, logLabel);
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
}

async function getUserToken(userConfig: AipUser) {
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

async function createUsers() {
  const timestamp: string = Date.now().toString();
  for (const user of functionalUsers()) {
    user.email = user.email.replace('@', `${timestamp}@`);
    await createUser(user);
    user.userToken = await getUserToken(user);
    user.userId = await getUserId(user.userToken);
  }
}

async function deleteUsers() {
  for (const user of functionalUsers()) {
    await deleteUser(user);
  }
}

function functionalUsers(): AipUser[] {
  return [
    // setupcaseUser,
    // noCasesUser,
    // hasCaseUser,
    // appealSubmittedUser,
    // awaitingReasonsForAppealUser,
    // partialAwaitingReasonsForAppealUser,
    // awaitingReasonsForAppealWithTimeExtensionUser,
    // awaitingClarifyingQuestionsWithTimeExtensionUser,
    // clarifyingQuestionsUser,
    awaitingCmaRequirementsUser
    // awaitingCmaRequirementsWithTimeExtensionUser,
    // cmaRequirementsSubmittedUser,
    // cmaListedUser,
    // preHearingUser,
    // decidedUser,
    // ftpaOutOfTimeApplicationStartedUser
  ];
}

const setupcaseUser: AipUser = {
  email: `setupcase@example.com`,
  password: 'Apassword123',
  forename: 'setupcase',
  surname: 'functionalCase'
};

const noCasesUser: AipUser = {
  email: `no-cases@example.com`,
  password: 'Apassword123',
  forename: 'no-cases',
  surname: 'functionalCase'
};

const hasCaseUser: AipUser = {
  email: `has-case@example.com`,
  password: 'Apassword123',
  forename: 'has-case',
  surname: 'functionalCase'
};

const appealSubmittedUser: AipUser = {
  email: `appeal-submitted@example.com`,
  password: 'Apassword123',
  forename: 'appeal-submitted',
  surname: 'functionalCase'
};

const awaitingReasonsForAppealUser: AipUser = {
  email: `awaiting-reasons-for-appeal@example.com`,
  password: 'Apassword123',
  forename: 'awaiting-reasons-for-appeal',
  surname: 'functionalCase'
};

const partialAwaitingReasonsForAppealUser: AipUser = {
  email: `partial-awaiting-reasons-for-appeal@example.com`,
  password: 'Apassword123',
  forename: 'partial-awaiting-reasons-for-appeal',
  surname: 'functionalCase'
};

const awaitingReasonsForAppealWithTimeExtensionUser: AipUser = {
  email: `awaitingReasonsForAppeal-with-time_extension@example.com`,
  password: 'Apassword123',
  forename: 'awaitingReasonsForAppeal-with-time_extension',
  surname: 'functionalCase'
};

const awaitingClarifyingQuestionsWithTimeExtensionUser: AipUser = {
  email: `awaitingClarifyingQuestions-with-time_extension@example.com`,
  password: 'Apassword123',
  forename: 'awaitingClarifyingQuestions-with-time_extension',
  surname: 'functionalCase'
};

const clarifyingQuestionsUser: AipUser = {
  email: `clarifying-questions@example.com`,
  password: 'Apassword123',
  forename: 'clarifying-questions',
  surname: 'functionalCase'
};

const awaitingCmaRequirementsUser: AipUser = {
  email: `awaitingCmaRequirements@example.com`,
  password: 'Apassword123',
  forename: 'awaitingCmaRequirements',
  surname: 'functionalCase'
};

const awaitingCmaRequirementsWithTimeExtensionUser: AipUser = {
  email: `awaitingCmaRequirements-with-time_extension@example.com`,
  password: 'Apassword123',
  forename: 'awaitingCmaRequirements-with-time_extension',
  surname: 'functionalCase'
};

const cmaRequirementsSubmittedUser: AipUser = {
  email: `cmaRequirementsSubmitted@example.com`,
  password: 'Apassword123',
  forename: 'cmaRequirementsSubmitted',
  surname: 'functionalCase'
};

const cmaListedUser: AipUser = {
  email: `cmaListed@example.com`,
  password: 'Apassword123',
  forename: 'cmaListed',
  surname: 'functionalCase'
};

const preHearingUser: AipUser = {
  email: `preHearing@example.com`,
  password: 'Apassword123',
  forename: 'preHearing',
  surname: 'functionalCase'
};

const decidedUser: AipUser = {
  email: `decided@example.com`,
  password: 'Apassword123',
  forename: 'decided',
  surname: 'functionalCase'
};

const ftpaOutOfTimeApplicationStartedUser: AipUser = {
  email: `ftpa-out-of-time-application-started@example.com`,
  password: 'Apassword123',
  forename: 'ftpa-out-of-time-application-started',
  surname: 'functionalCase'
};

export {
  setTestingSupportToken,
  createUsers,
  deleteUsers,
  getUserToken,
  getUserId,
  functionalUsers,
  AipUser,
  setupcaseUser,
  noCasesUser,
  hasCaseUser,
  appealSubmittedUser,
  awaitingReasonsForAppealUser,
  partialAwaitingReasonsForAppealUser,
  awaitingReasonsForAppealWithTimeExtensionUser,
  awaitingClarifyingQuestionsWithTimeExtensionUser,
  clarifyingQuestionsUser,
  awaitingCmaRequirementsUser,
  awaitingCmaRequirementsWithTimeExtensionUser,
  cmaRequirementsSubmittedUser,
  cmaListedUser,
  preHearingUser,
  decidedUser,
  ftpaOutOfTimeApplicationStartedUser
};
