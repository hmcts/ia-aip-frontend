import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  overviewPage(I) {
    When(/^I visit the overview page$/, async () => {
      await I.amOnPage(testUrl + paths.overview);
    });

    Then(/^I should see the 'do this next section' for 'New - Appeal started'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//*[@id="doThisNextTitle"]/h2[1]');
      I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'Saved - Appeal started'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//*[@id="doThisNextTitle"]/h2[1]');
      I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.appealStarted.finishQuestions}</p>`);

    });

    Then(/^I should see the 'do this next section' for 'Appeal submitted'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.nothingToDo, '//*[@id="doThisNextTitle"]/h2[1]');
      I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.appealSubmitted.detailsSent}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'Awaiting reasons for appeal'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//*[@id="doThisNextTitle"]/h2[1]');
      I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.tellUsWhy}</p>`);
    });

    Then(/^I should see the 'do this next section' for 'Saved - Awaiting reasons for appeal'$/, () => {
      I.see(i18n.pages.overviewPage.doThisNext.toDo, '//*[@id="doThisNextTitle"]/h2[1]');
      I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.awaitingReasonsForAppeal.partiallySaved}</p>`);
    });
  }
};
