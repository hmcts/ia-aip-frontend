module.exports = {
  outOfTimeAppeal(I) {
    Then(/^I should see late appeal page$/, async () => {
      await I.seeInCurrentUrl('/home-office/appeal-late');
      await I.see('Your appeal is late', 'h1');
    });

    When(/^I enter "([^"]*)" as the reason for being late$/, async (reason) => {
      I.fillField('#appeal-late', reason);
    });
  }
};
