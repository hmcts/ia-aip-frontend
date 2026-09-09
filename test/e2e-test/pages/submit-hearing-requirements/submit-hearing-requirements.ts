import moment from 'moment';
import { paths } from '../../../../app/paths';
import { dayMonthYearFormat } from '../../../../app/utils/date-utils';
import i18n from '../../../../locale/en.json';

module.exports = {
  submitHearingRequirements(I) {
    Then(/^I see hearing requirement section "([^"]*)" saved$/, async (selector: string) => {
      await I.see('Saved',`//ol/li[${selector}]/ul/li[1]/strong`);
    });

    Then('I see Are there any dates between today\'s date and 6 weeks time that you or any witnesses cannot go to the hearing?', async () => {
      await I.waitInUrl('/hearing-dates-avoid',10);
      const today = moment().format(dayMonthYearFormat);
      const finalDate = moment().add(42,'days').format(dayMonthYearFormat);
      await I.see('Are there any dates between ' + today + ' and ' + finalDate + ' that you or any witnesses cannot go to the hearing?','h1');
    });

    When('I should see the what type of interpreter nlr page', async () => {
      await I.waitInUrl(paths.submitHearingRequirements.nlrHearingInterpreterTypes, 10);
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterTypePage.title, 'h1');
      await I.see(i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.spokenLanguageOption, 'label');
      await I.see(i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.spokenLanguageOptionHint, 'div.govuk-hint');
      await I.see(i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.signLanguageOption, 'label');
      await I.see(i18n.pages.hearingRequirements.accessNeedsSection.interpreterTypePage.signLanguageOptionHint, 'div.govuk-hint');
    });

    When('I see the nlr spoken interpreter details page', async () => {
      await I.waitInUrl(paths.submitHearingRequirements.nlrHearingInterpreterSpokenLanguageSelection, 10);
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSpokenLanguageSelection.title, 'h1');
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSpokenLanguageSelection.text, 'p');
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSpokenLanguageSelection.dropdownListText, 'label');
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSpokenLanguageSelection.checkBoxText, 'label');
    });

    When('I see the nlr sign interpreter details page', async () => {
      await I.waitInUrl(paths.submitHearingRequirements.nlrHearingInterpreterSignLanguageSelection, 10);
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSignLanguageSelection.title, 'h1');
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSignLanguageSelection.text, 'p');
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSignLanguageSelection.dropdownListText, 'label');
      await I.see(i18n.pages.hearingRequirements.nlrNeedsSection.interpreterSignLanguageSelection.checkBoxText, 'label');
    });
  }
};
