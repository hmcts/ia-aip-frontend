import moment from 'moment';
import { paths } from '../../../../app/paths';
import { dayMonthYearFormat } from '../../../../app/utils/date-utils';

module.exports = {
  appealSent(I) {
    Then('I am on the appeal details sent page', async () => {
      I.seeInCurrentUrl(paths.appealSubmitted.confirmation);
    });

    Then('I see the respond by date is 4 weeks in the future', async () => {
      I.seeInSource(moment().add(28,'days').format(dayMonthYearFormat));
    });

    Then('I see the respond by date is 5 days in the future', async () => {
      I.seeInSource(moment().add(5,'days').format(dayMonthYearFormat));
    });

    Then('I see the pay by date is 14 days in the future', async () => {
      I.seeInSource(moment().add(14,'days').format(dayMonthYearFormat));
    });

    When('I click on the See your appeal progress link', async () => {
      I.click('See your appeal progress');
    });
  }
};
