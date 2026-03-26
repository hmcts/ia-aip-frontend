import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  nonLegalRep(I) {
    Given('I should be taken to the non legal rep name page', async () => {
      await I.waitInUrl(testUrl + paths.appealStarted.nlrName, 10);
    });

    Given('I should be taken to the non legal rep address page', async () => {
      await I.waitInUrl(testUrl + paths.appealStarted.nlrAddress, 10);
    });

    Given('I should be taken to the non legal rep contact details page', async () => {
      await I.waitInUrl(testUrl + paths.appealStarted.nlrContactDetails, 10);
    });

    Given('I enter a non legal rep name', async () => {
      await I.fillField('#nlrGivenNames', 'nlrForename');
      await I.fillField('#nlrFamilyName', 'nlrSurname');
    });

    Given('I enter a non legal rep address without postcode', async () => {
      await I.fillField('#address-line-1', 'Some line 1');
      await I.fillField('#address-town', 'Some town city');
    });

    Given('I enter a non legal rep address with invalid postcode', async () => {
      await I.fillField('#address-line-1', 'Some line 1');
      await I.fillField('#address-town', 'Some town city');
      await I.fillField('#address-postcode', 'invalid');
    });

    Given('I enter a valid non legal rep address', async () => {
      await I.fillField('#address-line-1', 'Some line 1');
      await I.fillField('#address-town', 'Some town city');
      await I.fillField('#address-postcode', 'CM15 9BN');
    });

    Given('I enter an invalid non legal rep email', async () => {
      await I.fillField('#emailAddress', 'invalid-email');
    });

    Given('I enter an invalid non legal rep phone number', async () => {
      await I.fillField('#phoneNumber', 'invalid-number');
    });

    Given('I enter a valid landline non legal rep phone number', async () => {
      await I.fillField('#phoneNumber', '01162601000');
    });

    Given('I enter a valid non legal rep phone number', async () => {
      await I.fillField('#phoneNumber', '07827297000');
    });

    Given('I enter a valid non legal rep email', async () => {
      await I.fillField('#emailAddress', 'valid@test.com');
    });

    When(/^I select "(Yes|No)" for same person and save and continue$/, async (isSamePerson: string) => {
      if (isSamePerson === 'Yes') {
        await I.checkOption('#isSponsorSameAsNlr');
      } else {
        await I.checkOption('#isSponsorSameAsNlr-2');
      }
      await I.click('Save and continue');
    });
  }
};
