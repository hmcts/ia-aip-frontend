import { paths } from '../../../../app/paths';

module.exports = {
  outOfTimeAppeal(I) {
    Then(/^I should see late appeal page$/, async () => {
      await I.seeInCurrentUrl(paths.homeOffice.appealLate);
      await I.see('Your appeal is late', 'h1');
    });

    When(/^I enter "([^"]*)" as the reason for being late$/, async (reason) => {
      await I.fillField('#appeal-late', reason);
    });

    Then(/^I see "([^"]*)" as my reason for being late$/, async (reason) => {
      await I.seeInField('textarea', reason);
    });

    Then('I dont see Uploaded file list', async () => {
      I.dontSeeElement('.evidence');
    });
  }
};
