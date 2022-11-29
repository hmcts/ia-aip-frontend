import { paths } from '../../../../app/paths';

const config = require('config');
const testUrl = config.get('testUrl');

module.exports = {
  makeAppealApplication(I) {
    When(/^I click the Withdraw my appeal link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.withdraw);
    });

    Then(/^I should see the Ask to withdraw the appeal page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.withdraw,10);
      await I.seeInCurrentUrl(paths.makeApplication.withdraw);
    });

    Then(/^I complete the Ask to withdraw the appeal page$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', 'Withdraw this appeal because of this reason');
    });

    Then(/^I should see the Ask to withdraw the appeal request page$/, async (text: string) => {
      await I.waitInUrl('make-an-application',10);
      await I.seeInCurrentUrl('make-an-application');
      await I.see('Withdraw this appeal because of this reason');
    });

    When(/^I click the Ask to change some of your details link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.updateAppealDetails);
    });

    Then(/^I should see the Ask to change some of your details page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.updateAppealDetails,10);
      await I.seeInCurrentUrl(paths.makeApplication.updateAppealDetails);
    });

    Then(/^I complete the Ask to change some of your details page$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', 'Change my name now pls');
    });

    Then(/^I should see the Ask to change some of your details request page$/, async (text: string) => {
      await I.waitInUrl('make-an-application',10);
      await I.seeInCurrentUrl('make-an-application');
      await I.see('Change my name now pls');
    });

    When(/^I click the Ask to link or unlink with another appeal link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.linkOrUnlink);
    });

    Then(/^I should see the Ask to link or unlink this appeal page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.linkOrUnlink,10);
      await I.seeInCurrentUrl(paths.makeApplication.linkOrUnlink);
    });

    Then(/^I complete the Ask to link or unlink this appeal page$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', 'link these appeals and this is why');
    });

    Then(/^I should see the Ask to link or unlink this appeal request page$/, async (text: string) => {
      await I.waitInUrl('make-an-application',10);
      await I.seeInCurrentUrl('make-an-application');
      await I.see('link these appeals and this is why');
    });

    When(/^I click the Ask for a judge to review a decision by a Tribunal Caseworker link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.judgesReview);
    });

    Then(/^I should see the Ask for a judge to review a decision page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.judgesReview,10);
      await I.seeInCurrentUrl(paths.makeApplication.judgesReview);
    });

    Then(/^I complete the Ask for a judge to review a decision page$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', 'Mr judge, please review this decision because of this reason');
    });

    Then(/^I should see the Ask for a judge to review a decision request page$/, async (text: string) => {
      await I.waitInUrl('make-an-application',10);
      await I.seeInCurrentUrl('make-an-application');
      await I.see('Mr judge, please review this decision because of this reason');
    });

    When(/^I click the Ask for something else link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.other);
    });

    Then(/^I should see the Ask for something else page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.other,10);
      await I.seeInCurrentUrl(paths.makeApplication.other);
    });

    Then(/^I complete the Ask for something else page$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', 'I would like this to happen please');
    });

    Then(/^I should see the Ask for something else request page$/, async (text: string) => {
      await I.waitInUrl('make-an-application',10);
      await I.seeInCurrentUrl('make-an-application');
      await I.see('I would like this to happen please');
    });

    When(/^I click the Ask for the appeal to be reinstated link$/, async (text: string) => {
      await I.amOnPage(testUrl + paths.makeApplication.reinstate);
    });

    Then(/^I should see the Ask for the appeal to be reinstated page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.reinstate,10);
      await I.seeInCurrentUrl(paths.makeApplication.reinstate);
    });

    Then(/^I complete the Ask for the appeal to be reinstated page$/, async (text: string) => {
      await I.fillField('#makeAnApplicationDetails', 'I would like this to be reinstated for this test');
    });

    Then(/^I should see the Ask for the appeal to be reinstated request page$/, async (text: string) => {
      await I.waitInUrl('make-an-application',10);
      await I.seeInCurrentUrl('make-an-application');
      await I.see('I would like this to be reinstated for this test');
    });

    Then(/^I should see the Do you want to provide supporting evidence for this request page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.supportingEvidenceUpdateAppealDetails,10);
      await I.seeInCurrentUrl(paths.makeApplication.supportingEvidenceUpdateAppealDetails);
    });

    Then(/^I should see the Your request has been sent to the Tribunal page$/, async (text: string) => {
      await I.waitInUrl(paths.makeApplication.requestSent,10);
      await I.seeInCurrentUrl(paths.makeApplication.requestSent);
    });

    Then(/^I should see You sent the Tribunal a request$/, async (text: string) => {
      await I.waitForText('You sent the Tribunal a request',10);
      await I.see('You sent the Tribunal a request');
    });
  }
};
