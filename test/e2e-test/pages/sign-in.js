const {signIn } = require("./helper-functions");

module.exports = {
signIn(I) {
    Given('I have a defined step', () => {
        I.amOnPage('https://localhost:3000');
    });

    When('I click start now', async () => {
        await  I.click('.govuk-button');
    });

    Then('I should see the sign in page', async () => {
        await I.seeInCurrentUrl('/login')
    });

    When('I enter creds and click sign in',async () => {
        await signIn()
    });

    Then('I should see the task-list page', async () => {
        await I.seeInCurrentUrl('task-list')
    });

}


}
