import { paths } from '../../../app/paths';

const { signInHelper, signInForUser } = require('./helper-functions');
const testUrl = require('config').get('testUrl');
const i18n = require('../../../locale/en.json');

module.exports = {
  signIn(I) {
    Given('I am on home page', () => {
      I.amOnPage(testUrl);
    });

    When('I click start now', async () => {
      await I.click('Start now');
    });

    Then('I should see the sign in page', async () => {
      await I.seeInTitle('Sign in - HMCTS Access');
    });

    Then('I should see the Create an account page', async () => {
      await I.seeInTitle('Self Register - HMCTS Access');
    });

    When('I click Sign in to your account', async () => {
      await I.click('Sign in to your account.');
    });

    When('I enter creds and click sign in', async () => {
      await signInHelper();
    });

    Given('I am authenticated as a valid appellant', async () => {
      I.amOnPage(testUrl + paths.common.login);
      await signInHelper();
      await I.seeInTitle(`Your appeal overview - ${i18n.serviceName} - ${i18n.provider}`);
    });

    Given('I have logged in', async () => {
      I.amOnPage(testUrl + paths.common.login);
      signInForUser('setupcase@example.com');
      await I.seeInTitle(`Your appeal overview - ${i18n.serviceName} - ${i18n.provider}`);
    });

    Given(/^I have logged in as an appellant in state "([^"]*)"$/, async (appealState) => {
      I.amOnPage(testUrl + paths.common.login);

      switch (appealState) {
        case 'appealStarted': {
          signInForUser('no-cases@example.com');
          break;
        }
        case 'Saved appealStarted': {
          signInForUser('has-case@example.com');
          break;
        }
        case 'appealSubmitted': {
          signInForUser('appeal-submitted@example.com');
          break;
        }
        case 'awaitingReasonsForAppeal': {
          signInForUser('awaiting-reasons-for-appeal@example.com');
          break;
        }
        case 'Saved awaitingReasonsForAppeal': {
          signInForUser('partial-awaiting-reasons-for-appeal@example.com');
          break;
        }
        case 'awaitingClarifyingQuestionsAnswers': {
          signInForUser('clarifying-questions@example.com');
          break;
        }
        default:
          break;
      }

      await I.seeInTitle(`Your appeal overview - ${i18n.serviceName} - ${i18n.provider}`);
    });
  }
};
