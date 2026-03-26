import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  hasSponsor(I) {
    Given('I should be taken to the has sponsor or nlr page', async () => {
      I.waitInUrl(testUrl + paths.appealStarted.hasSponsorOrNlr, 10);
    });

    Given('I go to the has sponsor or nlr page', async () => {
      await I.amOnPage(testUrl + paths.appealStarted.hasSponsorOrNlr);
    });

    When(/^I select "(Yes|No)" for sponsor and "(Yes|No)" for non-legal representative and click continue$/, async (hasSponsor: string, hasNlr: string) => {
      if (hasSponsor === 'Yes') {
        await I.checkOption('#hasSponsor');
      } else {
        await I.checkOption('#hasSponsor-2');
      }
      if (hasNlr === 'Yes') {
        await I.checkOption('#hasNonLegalRep');
      } else {
        await I.checkOption('#hasNonLegalRep-2');
      }
      await I.click('Save and continue');
    });

    When('I should be taken to the is sponsor and nlr the same person page', async () => {
      I.waitInUrl(testUrl + paths.appealStarted.isSponsorSameAsNlr, 10);
    });
  }
};
