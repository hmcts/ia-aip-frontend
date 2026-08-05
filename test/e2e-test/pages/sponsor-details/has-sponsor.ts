import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  hasSponsor(I) {
    Given('I should be taken to the has sponsor page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.hasSponsor);
    });

    When('I choose No, wait 3 seconds and click Save and continue', async () => {
      await I.checkOption('#answer-2');
      I.wait(3);
      await I.click('Save and continue');
    });

    When('I choose Yes and click continue', async () => {
          await I.checkOption('#answer');
          I.wait(3);
          await I.click('Save and continue');
        });
  }
};
