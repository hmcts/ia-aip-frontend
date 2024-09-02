import { getUserToken } from './idam-service';

const config = require('config');
const caseOfficerUserName = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword = process.env.TEST_CASEOFFICER_PASSWORD;
const homeOfficeGenericUsername = config.get('testAccounts.testHomeOfficeGenericUserName');
const homeOfficeGenericPassword = process.env.TEST_HOMEOFFICE_GENERIC_PASSWORD;

export class AuthenticationService {

  async signInAsCaseOfficer() {
    const userConfig = {
      email: caseOfficerUserName,
      password: caseOfficerPassword
    };
    return getUserToken(userConfig);
  }

  async signInAsHomeOfficeOfficer() {
    const userConfig = {
      email: homeOfficeGenericUsername,
      password: homeOfficeGenericPassword
    };
    return getUserToken(userConfig);
  }
}
