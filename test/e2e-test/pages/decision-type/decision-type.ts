import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  decisionType(I) {
    When('I go to appeal overview page', () => {
      I.retry(3).amOnPage(testUrl + '/appeal-overview');
    });

    Given('I should be taken to the decision type page', async () => {
      await I.waitInUrl(paths.appealStarted.decisionType,30);
      await I.seeInCurrentUrl(paths.appealStarted.decisionType);
    });

    When(/^I click on the decision-type link$/, async () => {
      await I.click('#typeOfDecisionLink');
    });

    When(/^I click on Decision with hearing as my type of decision and click Save and continue$/, async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });

    Given('I am on the decision type page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.decisionType);
    });
    When('I select I want the appeal to be decided with a hearing and click Save and continue', async () => {
      await I.checkOption('#answer');
      await I.click('Save and continue');
    });
    Then('I should see the the decision type page', async () => {
      I.seeInCurrentUrl(paths.appealStarted.decisionType);
    });

    Given('I am on the appeal payment page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.payNow);
    });
    When('I select No, I will pay later and click Save and continue', async () => {
      I.checkOption('#answer-2');
      await I.click('Save and continue');
    });
    Then('I should be taken to the pcq page', async () => {

      await I.wait(5);
      const numOfPCQElements = await I.retry(3).grabNumberOfVisibleElements('form[action="/start-page"] button[formaction="/opt-out"]');
      if (numOfPCQElements === 1) {
        await I.retry(3).click("I don't want to answer these questions");
      }
      await I.wait(5);
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
        await I.waitInUrl(paths.appealStarted.payNow,15);
        await I.seeInCurrentUrl(paths.appealStarted.payNow);
        if (paChoice === 'PA pay now') {
          await I.checkOption('#answer');
        } else {
          await I.checkOption('#answer-2');
        }
      }
    });
  }
};
