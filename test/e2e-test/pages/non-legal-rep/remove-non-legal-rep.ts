import { paths } from '../../../../app/paths';

const config = require('config');
const i18n = require('../../../../locale/en.json');
const testUrl = config.get('testUrl');

module.exports = {
  removeNonLegalRep(I) {
    When(/^I should (see|not see) the Remove non-legal representative link in the appeal overview page$/, async (visibility: string) => {
      if (visibility === 'see') {
        await I.see(i18n.pages.overviewPage.removeNlrFromCase, 'a.govuk-link');
      } else {
        await I.dontSee(i18n.pages.overviewPage.removeNlrFromCase, 'a.govuk-link');
      }
    });

    When(/^I should see the Remove myself as non-legal representative link in the appeal overview page$/, async () => {
      await I.see(i18n.pages.overviewPage.removeSelfAsNlr, 'a.govuk-link');
    });

    Given('I go to the remove non-legal representative page via URL', async () => {
      await I.amOnPage(testUrl + paths.nonLegalRep.removeNonLegalRep);
    });

    Given('I should see the forbidden page', async () => {
      await I.waitInUrl(testUrl + paths.common.forbidden, 10);
      await I.see(i18n.pages.forbidden.title, 'h1');
    });

    Given('I should see Remove your non-legal representative page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.removeNonLegalRep, 10);
      await I.see(i18n.pages.removeNonLegalRepresentative.title, 'h1');
      await I.see(i18n.pages.removeNonLegalRepresentative.paragraphOne, 'p');
      await I.see(i18n.pages.removeNonLegalRepresentative.paragraphTwo, 'p');
      await I.see(i18n.pages.removeNonLegalRepresentative.statement, 'legend');
      await I.see(i18n.pages.removeNonLegalRepresentative.agreement, 'label');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.titlePersonal, 'h1');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.paragraphOnePersonal, 'p');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.agreementPersonal, 'label');
    });

    Given('I should see Remove yourself as non-legal representative page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.removeNonLegalRep, 10);
      await I.see(i18n.pages.removeNonLegalRepresentative.titlePersonal, 'h1');
      await I.see(i18n.pages.removeNonLegalRepresentative.paragraphOnePersonal, 'p');
      await I.see(i18n.pages.removeNonLegalRepresentative.statement, 'legend');
      await I.see(i18n.pages.removeNonLegalRepresentative.agreementPersonal, 'label');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.title, 'h1');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.paragraphOne, 'p');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.paragraphTwo, 'p');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.agreement, 'label');
    });

    Given('I should see the removed your non legal rep confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.removeNonLegalRepConfirmation, 10);
      await I.see(i18n.pages.removeNonLegalRepresentative.confirmation.title, 'h1');
      await I.see(i18n.pages.successPage.whatHappensNext, 'h2');
      await I.see(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItems[0], 'li');
      await I.see(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItems[1], 'li');
      await I.see(i18n.pages.successPage.seeProgress);
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.confirmation.titlePersonal, 'h1');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItemsPersonal[0], 'li');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItemsPersonal[1], 'li');
      await I.dontSee(i18n.pages.successPage.backToCaseList);
    });

    Given('I should see the removed yourself as non legal rep confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.removeNonLegalRepConfirmation, 10);
      await I.see(i18n.pages.removeNonLegalRepresentative.confirmation.titlePersonal, 'h1');
      await I.see(i18n.pages.successPage.whatHappensNext, 'h2');
      await I.see(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItemsPersonal[0], 'li');
      await I.see(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItemsPersonal[1], 'li');
      await I.see(i18n.pages.successPage.backToCaseList);
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.confirmation.title, 'h1');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItems[0], 'li');
      await I.dontSee(i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItems[1], 'li');
      await I.dontSee(i18n.pages.successPage.seeProgress);
    });

  }
};
