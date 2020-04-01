import { getUserToken } from './idam-service';

const config = require('config');

export class AuthenticationService {

  async signInAsCaseOfficer() {
    const userConfig = {
      email: config.get('testAccounts.testCaseOfficerUserName'),
      password: config.get('testAccounts.testCaseOfficerPassword')
    };
    return getUserToken(userConfig);
  }

  async signInAsHomeOfficeOfficer() {
    const userConfig = {
      email: config.get('testAccounts.testHomeOfficeGenericUserName'),
      password: config.get('testAccounts.testHomeOfficeGenericPassword')
    };
    return getUserToken(userConfig);
  }
}
