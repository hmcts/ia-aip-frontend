module.exports = {
    checkAndSend(I) {
        When(/^I click on the check and send link$/, async () => {
            await I.click('a[href*="/check-and-send"');

        });
        Then(/^I should be taken to the check\-and\-send page$/, async () => {
            await I.seeInCurrentUrl('check-and-send')
        });
        When(/^I check the checkbox and click send$/, async () => {
            await I.click('#statement');
            await  I.click('.govuk-button');

        });
        Then(/^I should be taken to the confirmation page$/, async () => {
            await I.seeInCurrentUrl('confirmation')
        });
    }
}
