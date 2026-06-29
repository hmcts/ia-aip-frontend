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

    Given(/^I should see the add non legal representative page content (with|without) sponsor$/, async (choice: string) => {
      await I.see(i18n.pages.addNonLegalRepresentative.title, 'h1');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphOne, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphTwo, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.paragraphThree, 'p');
      await I.see(i18n.pages.addNonLegalRepresentative.sections.stepOne, 'h2');
      await I.see(i18n.pages.addNonLegalRepresentative.tasks.provideNlrEmail.title, 'li');
      await I.see(i18n.pages.addNonLegalRepresentative.sections.stepTwo, 'h2');
      if (choice === 'with') {
        await I.see(i18n.pages.addNonLegalRepresentative.tasks.isNlrSameAsSponsor.title, 'li');
      } else {
        await I.dontSee(i18n.pages.addNonLegalRepresentative.tasks.isNlrSameAsSponsor.title, 'li');
      }
      await I.see(i18n.pages.addNonLegalRepresentative.tasks.provideNlrName.title, 'li');
      await I.see(i18n.pages.addNonLegalRepresentative.tasks.provideNlrAddress.title, 'li');
      await I.see(i18n.pages.addNonLegalRepresentative.tasks.provideNlrPhone.title, 'li');
      await I.see(i18n.pages.addNonLegalRepresentative.sections.stepThree, 'h2');
      await I.see(i18n.pages.addNonLegalRepresentative.tasks.checkAndSend.title, 'li');
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

    When('I should see the userNotExisting error', async () => {
      await I.see(i18n.pages.addNonLegalRepresentative.userNotExistsError, 'div.govuk-error-summary a');
    });

    When('I should be taken to the invite nlr to create an account page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.inviteToCreateAccount, 10);
      await I.see(i18n.pages.inviteNlrToCreateAccount.title, 'h1');
      await I.see(i18n.pages.addNonLegalRepresentative.instructionsPartOne, 'p.govuk-inset-text');
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

    Given('I should be taken to the invite to join appeal confirmation page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.inviteToJoinAppealConfirmation, 10);
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

    Given(/^I should see the add nlr task list page with "([^"]*)" marked as "(To do|Saved|Cannot start yet)"$/, async (taskTitle: string, status: string) => {
      let taskLocator: Locator;
      if (status === 'Cannot start yet') {
        taskLocator = locate('li.task-list__item').withText(taskTitle);
      } else {
        taskLocator = locate('li.task-list__item').withChild('a').withText(taskTitle);
      }
      await I.seeElement(taskLocator);
      const tag: Locator = taskLocator.find('.govuk-tag');
      await I.see(status, tag);
    });

    Given('I should be taken to the check details and send invite page', async () => {
      await I.waitInUrl(testUrl + paths.nonLegalRep.provideNlrDetailsCheckAndSend, 10);
    });
  }
};
