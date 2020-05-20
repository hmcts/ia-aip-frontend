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

    Then(/^I should see the 'do this next section' for 'Saved - Awaiting reasons for appeal'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//h2[1]');
      I.seeInSource(`<p>${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partial.description}</p>`);
    });

    Then(/^I should see the 'ask for more time' link$/, () => {
      I.seeElement('//a[contains(., "Ask for more time")]');
    });

    When(/^I click 'ask for more time'$/, () => {
      I.click('Ask for more time');
    });

    Then(/^I see the respond by date is "([^"]*)"$/, async (respondByDate) => {
      I.seeInSource(respondByDate);
    });
  }
};
