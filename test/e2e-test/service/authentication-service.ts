import { getUserToken } from './idam-service';

const config = require('config');
const caseOfficerUserName = config.get('testAccounts.testCaseOfficerUserName');
const caseOfficerPassword = config.get('testAccounts.testCaseOfficerPassword');
const homeOfficeGenericUsername = config.get('testAccounts.testHomeOfficeGenericUserName');
const homeOfficeGenericPassword = config.get('testAccounts.testHomeOfficeGenericPassword');

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
