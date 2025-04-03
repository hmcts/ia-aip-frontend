import { paths } from '../../../../app/paths';
const assert = require('assert');
const config = require('config');
let caseReferenceNumber;
let firstName;
let lastName;
let exuiBaseUrl;
let appealReference;

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
      await I.retry(3).amOnPage(exuiBaseUrl + 'cases/case-create/IA/Asylum/startAppeal/startAppealchecklist');
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
      await I.waitForText('Type of appeal', 60);
      await I.click('#appealType-deprivation');
      await I.click('Continue');
      await I.waitForText('The grounds of your appeal', 60);
      await I.click('#appealGroundsDeprivation_values-disproportionateDeprivation');
      await I.click('Continue');
      await I.waitForText('Basic details', 60);
      await I.fillField('#appellantTitle', 'Mr');
      await I.fillField('#appellantGivenNames', 'Jose');
      await I.fillField('#appellantFamilyName', 'Gonzalez');
      await I.fillField('#appellantDateOfBirth-day', '10');
      await I.fillField('#appellantDateOfBirth-month', '02');
      await I.fillField('#appellantDateOfBirth-year', '1999');
      await I.click('Continue');
      await I.waitForText('What is the appellant\'s nationality?', 60);
      await I.click('#appellantStateless-isStateless');
      await I.click('Continue');
      await I.waitForText('Appellant\'s address', 60);
      await I.click('#appellantHasFixedAddress_No');
      await I.click('Continue');
      await I.waitForText('The appellant\'s contact preference', 60);
      await I.click('#contactPreference-wantsEmail');
      await I.waitForVisible('#email', 30);
      await I.fillField('#email', 'josegonzalez99@mailnesia.com');
      await I.click('Continue');
      await I.waitForText('Appellant\'s sponsor', 60);
      await I.click('#hasSponsor_No');
      await I.click('Continue');
      await I.waitForText('Deportation order', 60);
      await I.click('#deportationOrderOptions_No');
      await I.click('Continue');
      await I.waitForText('New matters', 60);
      await I.click('#hasNewMatters_No');
      await I.click('Continue');
      await I.waitForText('Has the appellant appealed against any other UK immigration decision?', 60);
      await I.selectOption('#hasOtherAppeals', 'No');
      await I.click('Continue');
      await I.waitForText('Legal representative details', 60);
      await I.fillField('#legalRepName', 'legal rep given name');
      await I.fillField('#legalRepFamilyName', 'legal rep family name');
      await I.fillField('#legalRepReferenceNumber', '017102');
      await I.fillField('#legalRepMobilePhoneNumber', '07827289432');
      await I.click('Continue');
      await I.waitForText('Hearing type', 60);
      await I.click('#rpDcAppealHearingOption-decisionWithHearing');
      await I.click('Continue');
      await I.waitForText('Check your answers', 60);
      await I.click('Save and continue');
      await I.waitForText('Do this next', 60);
      await I.click('Close and Return to case details');
      await I.waitForText('Current progress of the case', 60);
      const currentUrl = await I.grabCurrentUrl();
      appealReference = currentUrl.split('case-details/')[1].split('#')[0].replaceAll('/', '');
      await I.selectOption('#next-step', 'Submit your appeal');
      await I.handleNextStep('Declaration', 'submitAppeal/submitAppealdeclaration', appealReference);
      await I.click('#legalRepDeclaration-hasDeclared');
      await I.click('Submit');
      await I.waitForText('Your appeal has been submitted', 60);
      await I.click('Close and Return to case details');
      await I.waitForText('Current progress of the case', 60);
    });

    When(/^I stop representing the client$/, async () => {
      await I.selectOption('#next-step', 'Stop representing a client');
      await I.handleNextStep('Once you\'ve submitted this request', 'removeRepresentation/removeRepresentationSingleFormPageWithComplex', appealReference);
      await I.see('Once you\'ve submitted this request');
      await I.click('Continue');
      await I.waitForText('Submit', 60);
      await I.click('Submit');
      await I.waitForText('Hide Filter', 60);
    });
  }
};
