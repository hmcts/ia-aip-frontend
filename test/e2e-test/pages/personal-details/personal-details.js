const {fillInDate} = require ("../helper-functions");
const { Selector } = require('testcafe');

module.exports = {
    fillInPersonalDetails(I){
        When(/^I click Your personal details$/, async () => {
            await   I.click('a[href*="/personal-details"]')

        });
        Then(/^I should be taken to the enter your name page$/, async () => {
            await I.seeInCurrentUrl('details/name')
        });

        When(/^Enter "([^"]*)" "([^"]*)" into the fields$/, async (givenName, familyName) => {
            I.fillField('#givenNames',givenName)
            I.fillField('#familyName',familyName)
        });
        Then(/^click save and continue$/, async () => {
            I.click('.govuk-button');
        });
        Then(/^I should be taken to the DOB page$/, async () => {
            await I.waitInUrl('details/date-of-birth')
            await I.seeInCurrentUrl('details/date-of-birth')
        });
        When(/^I enter "([^"]*)" "([^"]*)" "([^"]*)" into each input and click continue$/, async (day,month,year) => {
            await fillInDate(day,month,year)
           await I.click('.govuk-button');

        });
        Then(/^I should be taken to nationality page$/, async () => {
            await I.waitInUrl('details/nationality')
             I.seeInCurrentUrl('details/nationality')
        });
        When(/^I pick "([^"]*)" from the drop down and click continue$/, async (nation) => {
            await I.selectOption('#nationality', nation)
            await I.click('.govuk-button');
        });
        Then(/^I should be taken to the enter your postcode page$/, async () => {
            await I.waitInUrl('details/enter-postcode')
            I.seeInCurrentUrl('details/enter-postcode')
        });
        When(/^I type "([^"]*)" and click continue$/, async (postcode) => {
            I.fillField("#postcode",postcode)
            I.click('.govuk-button');
        });
        Then(/^I should be taken to the what is your address page$/, async () => {
            await I.waitInUrl('postcode-lookup')
             I.seeInCurrentUrl('postcode-lookup')
        });
        When(/^I choose the first item from the dropdown list and click continue$/, async () => {
            await I.selectOption('#address', '52526732')
            I.click('.govuk-button');
        });
        Then(/^I should be taken to the confirm address page$/, async () => {
            await I.waitInUrl('details/enter-address')
             I.seeInCurrentUrl('details/enter-address')
        });
        When(/^I click continue$/, async () => {
            await I.click('.govuk-button');
        });
        Then(/^I should be taken to the task\-list$/, async () => {
            await I.waitInUrl('task-list')
             I.seeInCurrentUrl('task-list')
        });


    }

}
