import { paths } from '../../../../app/paths';
const assert = require('assert');
const config = require('config');
let caseReferenceNumber;
let firstName;
let lastName;
let exuiBaseUrl;

const testUrl = config.get('testUrl');
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

if (testUrl.includes('localhost')) {
  exuiBaseUrl = 'http://localhost:3002/';
} else if (testUrl.includes('aat') || testUrl.includes('preview')) {
  exuiBaseUrl = 'https://manage-case.aat.platform.hmcts.net/';
} else if (testUrl.includes('demo')) {
  exuiBaseUrl = 'https://manage-case.demo.platform.hmcts.net/';
}
module.exports = {
  legalRepCreateCase(I) {
    When(/^I create a new case and submit it$/, async () => {
      await I.retry(3).amOnPage(exuiBaseUrl + 'cases/case-filter');
      await I.waitForElement('#cc-jurisdiction option[value="IA"]', 60);
      await I.selectOption('#cc-jurisdiction', 'Immigration & Asylum');
      await I.selectOption('#cc-case-type', 'Appeal* master');
      await I.selectOption('#cc-event', 'Start your appeal');
      await I.click('Start');
      await I.waitForText('Tell us about your client', 60);
      await I.click('#checklist_checklist2-isNotDetained');
      await I.click('Continue');
      await I.waitForText('Location', 60);
      await I.click('#appellantInUk_Yes');
      await I.click('Continue');
      await I.waitForText('Home Office details', 60);
      await I.fillField('#homeOfficeReferenceNumber', '012345678');
      await I.fillField('#homeOfficeDecisionDate-day', day);
      await I.fillField('#homeOfficeDecisionDate-month', month);
      await I.fillField('#homeOfficeDecisionDate-year', year);
      await I.click('Continue');
      await I.waitForText('Upload the Notice of Decision', 60);
      await I.click('Add new');
      await I.wait(2);
      await I.attachFile('#uploadTheNoticeOfDecisionDocs_0_document', '/test/files/valid-image-file.png');
      await I.waitForInvisible('span.error-message', 30);
      await I.fillField('#uploadTheNoticeOfDecisionDocs_0_description', 'Home office decision letter document');
      await I.click('Continue');
      await I.waitForText('Basic details', 60);
      await I.fillField('#appellantTitle', 'Mr');
      await I.fillField('#appellantGivenNames', 'Jose');
      await I.fillField('#appellantFamilyName', 'Gonzalez');
      await I.fillField('#appellantDateOfBirth-day', '10');
      await I.fillField('#appellantDateOfBirth-month', '02');
      await I.fillField('#appellantDateOfBirth-year', '1999');
      await I.click('Continue');
      await I.waitForText('Tell us about your client\'s nationality', 60);
      await I.click('#appellantStateless-isStateless');
      await I.click('Continue');
      await I.waitForText('Your client\'s address', 60);
      await I.click('#appellantHasFixedAddress_No');
      await I.click('Continue');
      await I.waitForText('The appellant\'s contact preference', 60);
      await I.click('#contactPreference-wantsEmail');
      await I.waitForVisible('#email', 30);
      await I.fillField('#email', 'josegonzalez99@mailnesia.com');
      await I.click('Continue');
      await I.waitForText('Type of appeal', 60);
      await I.click('#appealType-deprivation');
      await I.click('Continue');
      await I.waitForText('The grounds of your appeal', 60);
      await I.click('#appealGroundsDeprivation_values-disproportionateDeprivation');
      await I.click('Continue');
      await I.waitForText('Deportation order', 60);
      await I.click('#deportationOrderOptions_No');
      await I.click('Continue');
      await I.waitForText('New matters', 60);
      await I.click('#hasNewMatters_No');
      await I.click('Continue');
      await I.waitForText('Has your client appealed against any other UK immigration decisions?', 60);
      await I.selectOption('#hasOtherAppeals', 'No');
      await I.click('Continue');
      await I.waitForText('Legal representative details', 60);
      await I.fillField('#legalRepName', 'legal rep name');
      await I.fillField('#legalRepReferenceNumber', '017102');
      await I.click('Continue');
      await I.waitForText('Hearing type', 60);
      await I.click('#rpDcAppealHearingOption-decisionWithHearing');
      await I.click('Continue');
      await I.waitForText('Check your answers', 60);
      await I.click('Save and continue');
      await I.waitForText('Your appeal details have been saved', 60);
      await I.click('Close and Return to case details');
      await I.waitForText('Current progress of the case', 60);
      await I.selectOption('#next-step', 'Submit your appeal');
      await I.click('Go');
      await I.waitForText('Declaration', 60);
      await I.click('#legalRepDeclaration-hasDeclared');
      await I.click('Submit');
      await I.waitForText('Your appeal has been submitted', 60);
      await I.click('Close and Return to case details');
      await I.waitForText('Current progress of the case', 60);
    });

    When(/^I stop representing the client$/, async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await I.selectOption('#next-step', 'Stop representing a client');
          await I.click('Go');
          await I.waitForText('Once you\'ve submitted this request', 60);
          await I.see('Once you\'ve submitted this request');
          break;
        } catch (err) {
          // do nothing
        }
      }
      await I.click('Continue');
      await I.waitForText('Submit', 60);
      await I.click('Submit');
      await I.waitForText('Hide Filter', 60);
    });
  }
};
