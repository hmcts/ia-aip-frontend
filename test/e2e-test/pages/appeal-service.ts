module.exports = {
  appealService(I) {
    Given(/^an appellant wants to challenge HO decisionl$/, async () => {
      await I.amOnPage('https://localhost:3000/eligible-service');
    });
    Then(/^I enter "([^"]*)" into the reason for appeal text box and click Save and Continue$/, async () => {
      await I.click('Continue');
    });
  }
};
