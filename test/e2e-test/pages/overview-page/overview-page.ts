import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  overviewPage(I) {
    When(/^I visit the overview page$/, async () => {
      await I.amOnPage(testUrl + paths.common.overview);
    });

    Then(/^I should see the appeal overview page$/, async () => {
      await I.waitInUrl(paths.common.overview,10);
      await I.seeInCurrentUrl(paths.common.overview);
    });

    When(/^I should see the 'do this next section' for 'New - Appeal started'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'Saved - Appeal started'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions}</p>`);
    });
    When(/^I should see the 'do this next section' for 'Appeal submitted'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.nothingToDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.appealSubmitted.detailsSent}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'Awaiting reasons for appeal'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.description}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'Awaiting reasons for appeal with time extensions' with respond by date '([^"]*)'$/, async (respondByDate) => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');

      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.descriptionAskForMoreTime}</p>`.replace('{{ applicationNextStep.deadline }}', respondByDate).trim());
      I.seeInSource(`${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.respondByTextAskForMoreTime}`);
    });

    Then(/^I should see the 'do this next section' for 'Awaiting clarifying questions with time extensions' with respond by date '([^"]*)'$/, async (respondByDate) => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');

      I.seeInSource(`${i18n.pages.overviewPage.askedForMoreTime }`);

      I.seeInSource(`${i18n.pages.overviewPage.doThisNext.clarifyingQuestions.descriptionAskForMoreTime}`.replace('{{ applicationNextStep.deadline }}', respondByDate).trim());
      I.seeInSource(`${i18n.pages.overviewPage.doThisNext.clarifyingQuestions.respondByTextAskForMoreTime}`);
    });

    Then(/^I should see the 'do this next section' for 'Saved - Awaiting reasons for appeal'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'awaitingCmaRequirements'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.description}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'awaitingCmaRequirements with time extensions' with respond by date '([^"]*)'$/, async (respondByDate) => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');

      I.seeInSource(`${i18n.pages.overviewPage.askedForMoreTime }`);

      I.seeInSource(`${i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.descriptionAskForMoreTime}`.replace('{{ applicationNextStep.deadline }}', respondByDate).trim());
      I.seeInSource(`${i18n.pages.overviewPage.doThisNext.awaitingCmaRequirements.respondByTextAskForMoreTime}`);
    });

    Then(/^I should see the 'ask for more time' link$/, () => {
      I.seeElement('//a[contains(., "Ask for more time")]');
    });

    Then(/^I should not see the 'ask for more time' link$/, () => {
      I.dontSeeElement('//a[contains(., "Ask for more time")]');
    });

    When(/^I click 'ask for more time'$/, () => {
      I.click('Ask for more time');
    });

    Then(/^I see the respond by date is "([^"]*)"$/, async (respondByDate) => {
      I.seeInSource(respondByDate);
    });

    When(/^I click the I am no longer representing myself link'$/, () => {
      I.click('I am no longer representing myself');
    });

    Then(/^I should see the 'nothing to do next section' for "([^"]*)" when statutory timeframe 24 weeks is Yes$/, (state) => {
      I.see(i18n.pages.overviewPage.doThisNext.nothingToDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.stf24w[state].detailsSent}</p>`);
      if (!['listing', 'awaitingRespondentEvidence'].includes(state)) {
        I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.stf24w[state].dueDate}</p>`);
      }
    });

    Then(/^I should see the 'do this next section' for 'awaitingReasonsForAppeal' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.new.description}</p>`);
      I.dontSeeElement('//a[contains(., "Ask for more time")]');
    });

    Then(/^I should see the 'do this next section' for 'awaitingReasonsForAppealPartial' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description}</p>`);
      I.dontSeeElement('//a[contains(., "Ask for more time")]');
    });

    Then(/^I should see the 'nothing to do next section' for 'respondentReview' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.nothingToDo, '//h2[1]');
      I.see('The Tribunal has asked the Home Office to review your appeal. The Home Office will look at all the information you sent to the Tribunal and will either withdraw or maintain their decision to refuse your application to stay in or enter the UK.');
      I.see('A Legal Officer will contact you to tell you what to do next.');
    });

    Then(/^I should see the 'do this next section' for 'decisionMaintained' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.see('The Home Office has reviewed your appeal and decided to maintain their decision to refuse your application to stay in or enter the UK. Read the Home Office Response.');
      I.see('If you want to respond, you can provide more evidence at any time.');
      I.see('Your appeal will be decided at the hearing.');
    });

    Then(/^I should see the 'do this next section' for 'prepareForHearing' and 'finalBundling' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.see('The Tribunal has set a date for your hearing. Here are the details:');
      I.see('Date: 01 March 2026');
      I.see('Time: 4:00 pm');
      I.see('Location: Taylor House');
      I.see('You can access your Notice of Hearing. It includes important');
      I.see('details about the hearing and you should read it carefully.');
    });

    Then(/^I should see the 'nothing to do next section' for 'pendingPayment' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.nothingToDo, '//h2[1]');
      I.see('Your appeal details have been sent to the Tribunal.');
      I.see('A Legal Officer will contact you to tell you what happens next.');
      I.see('What is a Legal Officer?');
    });

    Then(/^I should see the 'do this next section' for 'submitHearingRequirements' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.see('You must respond by 14 March 2026');
      I.see('It’s important to respond by the deadline in order for the Tribunal to process your appeal effectively.');
      I.see('What to expect at a hearing');
    });

    Then(/^I should see the 'do this next section' for 'awaitingClarifyingQuestionsAnswers' when statutory timeframe 24 weeks is Yes$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.see('You need to answer some questions about your appeal.');
      I.see('You need to respond by 07 May 2020.');
    });
  }
};
