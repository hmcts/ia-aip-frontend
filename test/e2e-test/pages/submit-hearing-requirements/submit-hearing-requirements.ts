import moment from 'moment';
import { dayMonthYearFormat } from '../../../../app/utils/date-utils';

module.exports = {
  submitHearingRequirements(I) {
    Then(/^I see hearing requirement section "([^"]*)" saved$/, async (selector: string) => {
      await I.see('SAVED',`//ol/li[${selector}]/ul/li[1]/strong`);
    });

    Then('I see Are there any dates between today\'s date and 6 weeks time that you or any witnesses cannot go to the hearing?', async () => {
      await I.waitInUrl('/hearing-dates-avoid',10);
      let today = moment().format(dayMonthYearFormat);
      let finalDate = moment().add(42,'days').format(dayMonthYearFormat);
      await I.see('Are there any dates between ' + today + ' and ' + finalDate + ' that you or any witnesses cannot go to the hearing?','h1');
    });
  }
};
