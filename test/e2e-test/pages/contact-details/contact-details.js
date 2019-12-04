module.exports = {
    fillInContactDetails(I) {
        Given(/^I click the contact details link$/, async () => {
            await  I.click('a[href*="/contact-details"')
        });
        Then(/^I should be taken to the contact\-details page$/, async () => {
            await  I.seeInCurrentUrl('contact-details')
        });
        When(/^I check the Text message box and type "([^"]*)" and click save and continue$/, async (number) => {
            await I.checkOption('#contactDetails-2');
            await I.fillField('#text-message-value',number);
            await I.click('.govuk-button');
        });
        Then(/^I should be taken to the task\-list page$/, async () => {
            await I.seeInCurrentUrl('task-list')
        });
    }


}
