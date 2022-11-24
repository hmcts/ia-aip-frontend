import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  decisionType(I) {
    Given('I should be taken to the decision type page', async () => {
      await I.seeInCurrentUrl(paths.appealStarted.decisionType);
    });

    When(/^I click on the decision-type link$/, async () => {
      await I.click('Decision with or without a hearing');
    });

    When(/^I click on Decision with hearing as my type of decision and click Save and continue$/, async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    Given('I am on the decision type page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.decisionType);
    });
    When('I select I want the appeal to be decided with a hearing', async () => {
      await I.checkOption('#answer');
      await I.click('Continue');
    });
    Then('I should see the the decision type page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.decisionType);
    });

    Given('I am on the appeal payment page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.payNow);
    });
    When('I select No, I will pay later', async () => {
      I.checkOption('#answer-2');
    });
    Then('I should see the appeal payment page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.payNow);
    });

    When(/^I select a decision (with|without) a hearing for a (non PA|PA pay now|PA pay later) appeal$/, async (hearingChoice, paChoice) => {
      if (hearingChoice === 'with') {
        await I.checkOption('#answer');
      } else {
        await I.checkOption('#answer-2');
      }
      if (paChoice !== 'non PA') {
        await I.click('Save and continue');
        await I.seeInCurrentUrl(paths.appealStarted.payNow);
        if (paChoice === 'PA pay now') {
          await I.checkOption('payNow');
        } else {
          await I.checkOption('payLater');
        }
      }
    });
  }
};
