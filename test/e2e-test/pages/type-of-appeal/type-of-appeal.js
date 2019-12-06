module.exports = {
    typeOfAppeal(I) {
        When(/^I click on the type\-of\-appeal link$/, async () => {
            await  I.click('a[href*="/type-of-appeal"')

        });
        Then(/^I should be taken to the appeal page$/, async () => {
            await I.waitInUrl('type-of-appeal')
             I.seeInCurrentUrl('type-of-appeal')
        });
        When(/^I click on the first checkbox and click save and continue$/, async () => {
            await I.checkOption('#appealType');
            await I.wait(3)
            await I.click('.govuk-button');
        });

        Then(/^I should be taken to the task\-list page$/, async () => {
            await I.waitInUrl('task-list')
             I.seeInCurrentUrl('task-list')
        })
    }
}
