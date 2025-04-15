import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  homeOfficeUpload(I) {
    Given('I am on the upload your home office decision letter page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.homeOfficeDecisionLetter);
    });

    Then('I should see the upload your home office decision letter page', async () => {
      await I.waitInUrl(paths.appealStarted.homeOfficeDecisionLetter,20);
      await I.seeInCurrentUrl(paths.appealStarted.homeOfficeDecisionLetter);
    });

    When('I upload a Home Office decision letter', async () => {
      await I.attachFile("input[type='file']", `/test/files/valid-image-file.png`);
      I.wait(3);
      I.click('Upload file');
      I.wait(3);
    });
  }
};
