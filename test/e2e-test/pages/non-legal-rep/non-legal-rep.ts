import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  nonLegalRep(I) {
    Given('I should be taken to the has non legal rep page', async () => {
      await I.waitInUrl(testUrl + paths.appealStarted.hasNonLegalRep, 10);
    });

    Given('I should be taken to the non legal rep email page', async () => {
      await I.waitInUrl(testUrl + paths.appealStarted.nonLegalRepEmail, 10);
    });

    Given('I enter an invalid non legal rep email', async () => {
      await I.fillField('#email-value', 'invalid-email');
    });

    Given('I enter a valid non legal rep email', async () => {
      await I.fillField('#email-value', 'valid@test.com');
    });
  }
};
