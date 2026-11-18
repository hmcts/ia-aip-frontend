import moment from 'moment';

module.exports = {
  queryManagement(I) {
    When(/^I should see the new message banner$/, async () => {
      await I.see('Important', 'div.govuk-notification-banner__header');
      await I.see('A new message is available to respond to in view messages.', 'div.govuk-notification-banner__content');
    });

    When(/^I should not see the new message banner$/, async () => {
      await I.dontSee('A new message is available to respond to in view messages.', 'div.govuk-notification-banner__content');
    });

    When(/^I should see the queries table with ([0-9]+) queries$/, async (numberOfQueries: string) => {
      const num: number = Number.parseInt(numberOfQueries);
      const locator: string = 'tbody > tr.govuk-table__row';
      await I.seeNumberOfVisibleElements(locator, num);
    });

    When(/^I should see row ([0-9]+) with values "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)"$/, async (
      rowNumber: string,
      subject: string,
      sentBy: string,
      sentOn: string,
      lastUpdatedBy: string,
      lastUpdatedOn: string,
      status: string
    ) => {
      const num: number = Number.parseInt(rowNumber);
      const rowLocator: LocatorOrString = locate('tbody > tr.govuk-table__row').at(num);
      await I.seeElement(rowLocator.withChild('td.govuk-table__cell').withText(subject));
      await I.seeElement(rowLocator.withChild('td.govuk-table__cell').withText(sentBy));
      await I.seeElement(rowLocator.withChild('td.govuk-table__cell').withText(sentOn));
      await I.seeElement(rowLocator.withChild('td.govuk-table__cell').withText(lastUpdatedBy));
      await I.seeElement(rowLocator.withChild('td.govuk-table__cell').withText(lastUpdatedOn));
      await I.seeElement(rowLocator.withChild('td.govuk-table__cell').withText(status));
    });

    When(/^I click row ([0-9]+) link$/, async (rowNumber: string) => {
      const num: number = Number.parseInt(rowNumber);
      const rowLocator: LocatorOrString = locate('tbody > tr.govuk-table__row').at(num);
      await I.click(rowLocator.find('a'));
    });

    When(/^I delete document ([0-9]+)$/, async (rowNumber: string) => {
      const num: number = Number.parseInt(rowNumber);
      const rowLocator: LocatorOrString = locate('tbody > tr.govuk-table__row').at(num);
      await I.click(rowLocator.find('a').withText('Delete'));
    });

    When(/^I see ([0-9]+) query cards?$/, async (numberOfQueries: string) => {
      const num: number = Number.parseInt(numberOfQueries);
      await I.seeNumberOfVisibleElements('div.govuk-summary-card', num);
    });

    async function seeQueryCardItem(rowLocator: Locator, text: string) {
      if (text != '') {
        await I.seeElement(rowLocator.withDescendant('dd.govuk-summary-list__value').withText(text));
      }
    }

    When(/^I see query card ([0-9]+) with title "([^"]*)", subject "([^"]*)", details "([^"]*)", attachments "([^"]*)", hearingRelated "([^"]*)", hearing date "([^"]*)", sent by "([^"]*)", sent on "([^"]*)"$/, async (
      rowNumber: string,
      title: string,
      subject: string,
      details: string,
      attachments: string,
      hearingRelated: string,
      hearingDate: string,
      sentBy: string,
      sentOn: string
    ) => {
      const num: number = Number.parseInt(rowNumber);
      const rowLocator: LocatorOrString = locate('div.govuk-summary-card').at(num);
      await I.seeElement(rowLocator.withDescendant('h2.govuk-summary-card__title').withText(title));
      await seeQueryCardItem(rowLocator, subject);
      await seeQueryCardItem(rowLocator, details);
      await seeQueryCardItem(rowLocator, attachments);
      await seeQueryCardItem(rowLocator, hearingRelated);
      await seeQueryCardItem(rowLocator, hearingDate);
      await seeQueryCardItem(rowLocator, sentBy);
      await seeQueryCardItem(rowLocator, sentOn);
    });

    When(/^I (see|dont see) the reviewing message text$/, async (visible: string) => {
      if (visible === 'see') {
        await I.see('The Immigration & Asylum Chamber are reviewing the message');
        await I.see('Our team will read the message and try to respond by 21 November 2026. It may take longer than this.');
      } else {
        await I.dontSee('The Immigration & Asylum Chamber are reviewing the message');
        await I.dontSee('Our team will read the message and try to respond by 21 November 2026. It may take longer than this.');
      }
    });

    When(/^I (see|dont see) the responded text$/, async (visible: string) => {
      if (visible === 'see') {
        await I.see('Send a follow-up message', 'h2.govuk-heading-m');
        await I.see('Only send follow-up messages related to the original message.', 'p.govuk-body');
        await I.see('Sending follow-up messages that are not related will delay the court\'s response.', 'p.govuk-body');
      } else {
        await I.dontSee('Send a follow-up message',);
        await I.dontSee('Only send follow-up messages related to the original message.');
        await I.dontSee('Sending follow-up messages that are not related will delay the court\'s response.');
      }
    });

    When(/^I (see|dont see) the closed text$/, async (visible: string) => {
      if (visible === 'see') {
        await I.see('This message has been closed by the Immigration & Asylum Chamber on 11 November 2026', 'strong.govuk-warning-text__text');
      } else {
        await I.dontSee('This message has been closed by the Immigration & Asylum Chamber on 11 November 2026');
      }
    });

    When(/^I (see|dont see) the close query request button$/, async (visible: string) => {
      if (visible === 'see') {
        await I.see('Request to close this message', 'a');
      } else {
        await I.dontSee('Request to close this message');
      }
    });

    When(/^I (see|dont see) the follow up button$/, async (visible: string) => {
      if (visible === 'see') {
        await I.see('Send a follow-up message', 'a');
      } else {
        await I.dontSee('Send a follow-up message');
      }
    });

    When(/^I see ([0-9]+) common query options?$/, async (numberOfQueries: string) => {
      const num: number = Number.parseInt(numberOfQueries);
      await I.seeNumberOfVisibleElements('input.govuk-radios__input', num + 1);
    });

    When('I see the ask query option', async () => {
      const div: Locator = locate('div.govuk-radios__item').withChild('label.govuk-radios__label').withText('Send a message via message');
      await I.seeElement(div);
      await I.seeElement(div.find('div.govuk-hint').withText('We try to answer messages within 10 working days, but it could take longer.'));
    });

    When(/^I select option "([^"]*)"$/, async (optionLabel: string) => {
      const locator: Locator = locate('div.govuk-radios__item').withChild('label.govuk-radios__label').withText(optionLabel);
      await I.seeElement(locator);
      await I.click(locator.find('input'));
    });

    When('I see the anything else section', async () => {
      await I.see('Anything else', 'h2.govuk-heading-m');
      await I.see('If you still need help, you can send a message.', 'p.govuk-body');
      await I.see('We try to answer messages within 10 working days, but it could take longer.', 'div.govuk-inset-text');
      await I.see('Return to appeal overview', 'a.govuk-button');
    });

    When('I see the message sharing permission page content', async () => {
      await I.see('Sharing this message with the other party', 'h2.govuk-heading-m');
      await I.see('All messages sent using this system are shared with the other party in the case as well as being sent to the Immigration & Asylum Chamber.', 'p.govuk-body');

      await I.see('Asking not to share your message', 'h2.govuk-heading-m');
      await I.see('You can ask not to share your message with the other party. The reasons for not sharing your message must be valid and the judge may decide that your message should be shared.', 'p.govuk-body');
      await I.see('Valid reasons for keeping a message between you and the Immigration & Asylum Chamber include the message being about:', 'p.govuk-body');
      await I.see('abc', 'li');
      await I.see('xyz', 'li');
      await I.see('If you need to send a message to the Immigration & Asylum Chamber and you do not want the other party to see it, email contactia@justice.gov.uk.', 'p.govuk-body');
      await I.see('Explain why the message should be kept between you and the Immigration & Asylum Chamber and make sure you include your full name and reference.', 'div.govuk-inset-text');

      await I.see('Confirm your message can be shared', 'h3.govuk-heading-s');
      await I.see('Yes, I agree my message can be shared with the other party', 'label.govuk-label');

      await I.see('Continue', 'button.govuk-button');
      await I.see('Cancel', 'a.cancel-button');
    });

    Then('I check the agreement', async () => {
      await I.click('Yes, I agree my message can be shared with the other party');
    });

    When('I see the Send a message page content', async () => {
      const subjectDivLocator = locate('div.govuk-form-group').withChild('label.govuk-label').withText('Message subject');
      await I.seeElement(subjectDivLocator);
      await I.see('The subject should be a summary of your message', subjectDivLocator.find('div.govuk-hint'));
      await I.seeElement(subjectDivLocator.find('input.govuk-input'));

      const detailsDivLocator = locate('div.govuk-form-group').withChild('label.govuk-label').withText('Message details');
      await I.seeElement(detailsDivLocator);
      await I.see('Include as many details as possible so case workers can respond to your message', detailsDivLocator.find('div.govuk-hint'));
      await I.seeElement(detailsDivLocator.find('textarea.govuk-textarea'));

      const hearingDivLocator = locate('div.govuk-form-group').withDescendant('legend.govuk-fieldset__legend').withText('Is this message related to a hearing?');
      await I.seeElement(hearingDivLocator);
      await I.see('Select Yes if this message is related to a hearing and provide the date of the hearing', hearingDivLocator.find('div.govuk-hint'));
      await I.seeElement(hearingDivLocator.find('label.govuk-radios__label').withText('Yes'));
      await I.seeElement(hearingDivLocator.find('label.govuk-radios__label').withText('No'));

      const uploadDivLocator = locate('div.govuk-inset-text').withChild('button.govuk-button').withText('Upload');
      await I.seeElement(uploadDivLocator);
      await I.see('Upload documents (optional)', uploadDivLocator.find('label'));
      await I.see('Only upload documents related to your message.\nTo upload documents to progress your claim, use the appropriate', uploadDivLocator.find('div.govuk-hint'));
      await I.seeElement(uploadDivLocator.find('input.govuk-file-upload'));
    });

    When(/^I see ([0-9]+) files? uploaded?$/, async (numberOfQueries: string) => {
      const num: number = Number.parseInt(numberOfQueries);
      await I.see((num < 2) ? 'Uploaded file' : 'Uploaded files', 'th.govuk-table__header');
      if (num === 0) {
        await I.see('No files uploaded', 'td.govuk-table__cell');
      }
      // await I.seeNumberOfVisibleElements('input.govuk-radios__input', num + 1);
    });

    When('I upload a valid document', async () => {
      await I.attachFile("input[type='file']", '/test/files/valid-pdf-file.pdf');
      await I.click('Upload');
    });

    When('I upload a valid image document', async () => {
      await I.attachFile("input[type='file']", '/test/files/valid-image-file.png');
      await I.click('Upload');
    });

    When('I upload a document too large', async () => {
      await I.attachFile("input[type='file']", '/test/files/invalid-file-too-big.png');
      await I.click('Upload');
    });

    When('I upload a document invalid format', async () => {
      await I.attachFile("input[type='file']", '/test/files/invalid-format-file.dat');
      await I.click('Upload');
    });

    When(/^I should (not see|see) the date of hearing field$/, async (visible: string) => {
      if (visible === 'not see') {
        await I.dontSee('For example, 31 05 2019');
      } else {
        await I.see('For example, 31 05 2019', 'div.govuk-hint');
        await I.seeElement('#day');
        await I.seeElement('#month');
        await I.seeElement('#year');
      }
    });

    When(/^I see "([^"]*)" for CYA row "([^"]*)" and change link (present|not present)$/, async (rowValue: string, rowTitle: string, changePresence: string) => {
      const cyaTableLocator: Locator = locate('dl.govuk-summary-list');
      const rowLocator: Locator = cyaTableLocator.find('div.govuk-summary-list__row').withChild('dt.govuk-summary-list__key').withText(rowTitle);
      await I.seeElement(rowLocator);
      const rowValueSplit: string[] = rowValue.split((' [] '));
      for (const text of rowValueSplit) {
        const element = rowLocator.find('dd.govuk-summary-list__value');
        await I.seeElement(element);
        await I.see(text, element);
      }
      const changeLinkLocator: Locator = rowLocator.find('dd.govuk-summary-list__actions').withChild('a.govuk-link').withText('Change');
      if (changePresence === 'present') {
        await I.seeElement(changeLinkLocator);
      } else {
        await I.dontSeeElement(changeLinkLocator);
      }
    });

    When(/^I dont see CYA row "([^"]*)"$/, async (rowTitle: string) => {
      const cyaTableLocator: Locator = locate('dl.govuk-summary-list');
      const rowLocator: Locator = cyaTableLocator.find('div.govuk-summary-list__row').withChild('dt.govuk-summary-list__key').withText(rowTitle);
      await I.dontSeeElement(rowLocator);
    });

    When('I should see the Sent message confirmation page', async () => {
      await I.see('You have sent your message', 'h1.govuk-panel__title');
      await I.see('What happens next', 'h2.govuk-heading-m');
      await I.see('A Tribunal Caseworker will look at your message and respond if deemed necessary', 'li');
      const tenDaysFromNow: string = moment().add(10, 'days').format('DD MMMM YYYY');
      await I.see(`This should be by ${tenDaysFromNow} but may take longer than that`, 'li');
      await I.see('See your appeal progress', 'a.govuk-button');
    });

    When('I see the Follow-up message page content', async () => {
      const detailsDivLocator = locate('div.govuk-form-group').withChild('label.govuk-label').withText('Message details');
      await I.seeElement(detailsDivLocator);
      await I.see('Include as many details as possible so case workers can respond to your message', detailsDivLocator.find('div.govuk-hint'));
      await I.seeElement(detailsDivLocator.find('textarea.govuk-textarea'));

      const uploadDivLocator = locate('div.govuk-inset-text').withChild('button.govuk-button').withText('Upload');
      await I.seeElement(uploadDivLocator);
      await I.see('Upload documents (optional)', uploadDivLocator.find('label'));
      await I.see('Only upload documents related to your message.\nTo upload documents to progress your claim, use the appropriate', uploadDivLocator.find('div.govuk-hint'));
      await I.seeElement(uploadDivLocator.find('input.govuk-file-upload'));
    });


    When('I see the Close query request page content', async () => {
      const detailsDivLocator = locate('div.govuk-form-group').withChild('label.govuk-label').withText('Why are you requesting closure of this message?');
      await I.seeElement(detailsDivLocator);
      await I.see('If you choose to request close this message, the Immigration & Asylum Chamber will mark this message thread as closed if deemed suitable for closure and no further responses will be made', detailsDivLocator.find('div.govuk-hint'));
      await I.seeElement(detailsDivLocator.find('textarea.govuk-textarea'));

      const uploadDivLocator = locate('div.govuk-inset-text').withChild('button.govuk-button').withText('Upload');
      await I.seeElement(uploadDivLocator);
      await I.see('Upload documents (optional)', uploadDivLocator.find('label'));
      await I.see('Only upload documents related to your message.\nTo upload documents to progress your claim, use the appropriate', uploadDivLocator.find('div.govuk-hint'));
      await I.seeElement(uploadDivLocator.find('input.govuk-file-upload'));
    });
  }
};
