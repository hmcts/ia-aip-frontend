import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

const PATHS = {
  'Ask for the hearing to be sooner': paths.makeApplication.expedite,
  'Ask to change the date of the hearing': paths.makeApplication.adjourn,
  'Ask to change the location of the hearing': paths.makeApplication.transfer,
  'Ask for something at the hearing': paths.makeApplication.updateHearingRequirements
};

module.exports = {
  makeHearingApplication(I) {
    When(/^I click the Ask to change your hearing date location or needs link$/, async () => {
      await I.amOnPage(testUrl + paths.makeApplication.askChangeHearing);
    });

    When('I select I want to ask for the hearing to be sooner and click continue', async () => {
      await I.checkOption('#hearingApplicationType');
      await I.click('Continue');
    });

    When('I select I want to ask for the hearing to be later and click continue', async () => {
      await I.checkOption('#hearingApplicationType-2');
      await I.click('Continue');
    });

    When('I select I want to change the hearing location and click continue', async () => {
      await I.checkOption('#hearingApplicationType-3');
      await I.click('Continue');
    });

    When('I select I want to ask for something at the hearing and click continue', async () => {
      await I.checkOption('#hearingApplicationType-4');
      await I.click('Continue');
    });

    When(/^I enter "([^"]*)" into the text area and click continue$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', text);
      await I.click('Continue');
    });

    Then(/^I should see the Ask to change something about your hearing page$/, async () => {
      await I.seeInCurrentUrl(paths.makeApplication.askChangeHearing);
    });

    Then(/^I should see "([^"]*)" on the page$/, async (text: string) => {
      await I.see(text);
    });
  }
};
