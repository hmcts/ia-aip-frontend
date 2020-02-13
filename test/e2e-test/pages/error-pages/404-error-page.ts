const configFile = require('config');
const testUrl = configFile.get('testUrl');

module.exports = {
  error404(I) {
    Given('I enter a non existent url', async () => {
      await I.amOnPage(testUrl + 'non-existent-url');
    });

    Then(/^I should see page not found error page$/, async () => {
      await I.see('Page not found', 'h1');
    });
  }
};
