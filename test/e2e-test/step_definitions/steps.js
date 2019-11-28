
const {signIn, fillInDate} = require("../pages/SignIn");
const { I } = inject();
const  {checkURL} = require("../pages/Page");

Given('I have a defined step', () => {
  I.amOnPage('https://localhost:3000');
});

When('I click start now', async () => {
await  I.click('.govuk-button');
});

Then('I should see the sign in page', async () => {
  await checkURL("/login")
});

When('I enter creds and click sign in',async () => {
    await signIn()
});

Then('I should see the task-list page', async () => {
 await checkURL('/task-list')
});

When(/^I click on Home office details$/,  async () => {
 await   I.click('a[href*="/home-office"]')
});

Then(/^I should be taken to the home office ref number page$/, async () => {
  await  I.seeInCurrentUrl('/home-office/details')
});

When(/^I enter "([^"]*)" and click Save and Continue/, async (refNumber) => {
 await   I.fillField('#homeOfficeRefNumber',refNumber)
 await   I.click('.govuk-button');

});

Then(/^I should see letter sent page$/,  async  () => {
   await I.seeInCurrentUrl('/letter-sent')
});

When(/^I enter a date before expiry$/,async  () => {
    const date = new Date
  await fillInDate(date.getDate(),date.getMonth() + 1 ,date.getFullYear() )
  I.click('.govuk-button');
});

Then(/^I expect to be redirect back to the task\-list$/, async () => {
  await  I.seeInCurrentUrl("/task-list")
});
