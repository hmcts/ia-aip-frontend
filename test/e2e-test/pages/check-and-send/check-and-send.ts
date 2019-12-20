module.exports = {
  checkAndSend(I) {
    When(/^I click on the check and send your appeal link$/, async () => {
      await I.click('Check and send your appeal');
    });
    Then(/^I should be taken to the check\-and\-send page$/, async () => {
      await I.seeInCurrentUrl('check-and-send');
      await I.see('Check your answers', 'h1');
    });
    // When(/^I check the checkbox and click send$/, async () => {});
    // Then(/^I should be taken to the confirmation page$/, async () => {});
  }
};
