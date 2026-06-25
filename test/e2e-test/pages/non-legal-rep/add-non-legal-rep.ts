import { paths } from '../../../../app/paths';

const config = require('config');
const i18n = require('../../../../locale/en.json');
const testUrl = config.get('testUrl');

module.exports = {
  addNonLegalRep(I) {
    Given('I should be taken to the add non legal representative page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.addNonLegalRep, 10);
    });

    Given('I should see the invited nlr to create an account confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.inviteToCreateAccountConfirmation, 10);
      await I.see(i18n.pages.inviteNlrToCreateAccount.confirmation.title, 'h1');
      await I.see(i18n.pages.successPage.whatHappensNext, 'h2');
      await I.see(i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems[0], 'li');
      await I.see('This will be sent to the email address you provided', 'li');
      await I.see(i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems[2], 'li');
      await I.see(i18n.pages.successPage.seeNonLegalRep, 'a.govuk-button');
    });

    Given('I should see the add non legal representative page content', async () => {
      await I.see(i18n.pages.addNonLegalRepresentative.title, 'h1');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphOne, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphTwo, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphThree, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.hint, 'div.govuk-inset-text');
      await I.see(i18n.pages.addNonLegalRepresentative.stepOne, 'h2');
      await I.see(i18n.pages.addNonLegalRepresentative.instructionsPartOne, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.linkPartOne, 'a.govuk-button');
      await I.see(i18n.pages.addNonLegalRepresentative.stepTwo, 'h2');
      await I.see(i18n.pages.addNonLegalRepresentative.instructionsPartTwo, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.linkPartTwo, 'a.govuk-button');
      await I.see(i18n.pages.addNonLegalRepresentative.stepThree, 'h2');
      await I.see(i18n.pages.addNonLegalRepresentative.instructionsPartThree, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.linkPartThree, 'button');
      await I.dontSee(i18n.pages.addNonLegalRepresentative.noEmailProvidedError);
      await I.dontSee(i18n.pages.addNonLegalRepresentative.provideEmailDirection);
      await I.dontSee(i18n.pages.addNonLegalRepresentative.noDetailsProvidedError);
      await I.dontSee(i18n.pages.addNonLegalRepresentative.provideNlrDetailsDirection);
      await I.dontSee(i18n.pages.addNonLegalRepresentative.userNotExistsError);
      await I.dontSee(i18n.pages.addNonLegalRepresentative.userNotExistDirection);
    });

    Given('I should be taken to the add another non legal representative page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.addAnotherNonLegalRep, 10);

      await I.see(i18n.pages.addNonLegalRepresentative.title, 'h1');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphOne, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphTwo, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphThree, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.another.hint, '.govuk-inset-text');
      await I.see(i18n.pages.addNonLegalRepresentative.another.statement, 'legend');
      await I.see(i18n.pages.addNonLegalRepresentative.another.agreement, 'label');
      await I.dontSee(i18n.validationErrors.addAnotherNlrAgreement);
    });

    When('I should see the stepTwoNoEmailProvided error', async () => {
      await I.see(i18n.pages.addNonLegalRepresentative.noEmailProvidedError, 'div.govuk-error-summary a');
      await I.see(i18n.pages.addNonLegalRepresentative.provideEmailDirection, 'div.govuk-inset-text > p');
    });

    When('I should see the stepThreeNoEmailProvided error', async () => {
      await I.see(i18n.pages.addNonLegalRepresentative.noEmailProvidedError, 'div.govuk-error-summary a');
      await I.see(i18n.pages.addNonLegalRepresentative.provideEmailDirection, 'div.govuk-inset-text > p');
    });

    When('I should see the stepThreeNoDetailsProvided error', async () => {
      await I.see(i18n.pages.addNonLegalRepresentative.noDetailsProvidedError, 'div.govuk-error-summary a');
      await I.see(i18n.pages.addNonLegalRepresentative.provideNlrDetailsDirection, 'div.govuk-inset-text > p');
    });

    When('I should see the stepThreeUserNotExisting error', async () => {
      await I.see(i18n.pages.addNonLegalRepresentative.userNotExistsError, 'div.govuk-error-summary a');
      await I.see(i18n.pages.addNonLegalRepresentative.userNotExistDirection, 'div.govuk-inset-text > p');
    });

    When('I should be taken to the invite nlr to create an account page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.inviteToCreateAccount, 10);
    });

    When('I should be taken to the provide non legal rep name page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrName, 10);
    });

    When('I should be taken to the provide non legal rep address page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrAddress, 10);
    });

    When('I should be taken to the provide non legal rep phone number page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrPhoneNumber, 10);
    });

    When('I should be taken to the provide non legal rep is same person page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrIsSamePerson, 10);
    });

    Given('I should be taken to the provide nlr details CYA page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrDetailsCheckAndSend, 10);
    });

    Given('I should be taken to the provide nlr details confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrDetailsConfirmation, 10);
      await I.see(i18n.pages.provideNlrDetails.confirmation.title, 'h1');
      await I.see(i18n.pages.successPage.whatHappensNext, 'h2');
      await I.see(i18n.pages.provideNlrDetails.confirmation.whatNextContent[0]);
      await I.see(i18n.pages.successPage.seeNonLegalRep, 'a.govuk-button');
    });

    Given('I should be taken to the invite nlr to join appeal confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.inviteToJoinAppealConfirmation, 10);
      await I.see(i18n.pages.inviteNlrToJoinAppeal.confirmation.title, 'h1');
      await I.see(i18n.pages.successPage.whatHappensNext, 'h2');
      await I.see(i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems[0], 'li');
      await I.see('This will be sent to the email address you provided - ', 'li');
      await I.see(i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems[2], 'li');
      await I.see(i18n.pages.successPage.seeProgress, 'a.govuk-button');
    });

    When(/^I fill email-value field with "([^"]*)"$/, async (email) => {
      await I.fillField('#email-value', email);
    });
  }
};
