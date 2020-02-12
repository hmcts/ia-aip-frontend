import { paths } from '../../../../app/paths';
import i18n from '../../../../locale/en.json';

const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  overviewPage(I) {
    When(/^I visit the overview page$/, async () => {
      await I.amOnPage(testUrl + paths.overview);
    });

    When(/^I should see the 'do this next section' for "([^"]*)"$/, (appealStage) => {
      switch (appealStage) {
        case 'New - Appeal started': {
          I.see(i18n.pages.overviewPage.doThisNext.toDo, '//*[@id="doThisNextTitle"]/h2[1]');
          I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions}</p>`);
          break;
        }
        case 'Saved - Appeal started': {
          I.see(i18n.pages.overviewPage.doThisNext.toDo, '//*[@id="doThisNextTitle"]/h2[1]');
          I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.appealStarted.fewQuestions}</p>`);
          break;
        }
        case 'Appeal submitted': {
          I.see(i18n.pages.overviewPage.doThisNext.nothingToDo, '//*[@id="doThisNextTitle"]/h2[1]');
          I.seeInSource(`<p class="govuk-body">${i18n.pages.overviewPage.doThisNext.appealSubmitted.detailsSent}</p>`);
          break;
        }
      }
    });
  }
};
