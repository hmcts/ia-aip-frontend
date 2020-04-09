import moment from 'moment';
import { paths } from '../../../../app/paths';
import { dayMonthYearFormat } from '../../../../app/utils/date-formats';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  reasonsForAppealConfirmation(I) {
    Then('I should see the reasons for appeal confirmation page', async () => {
      I.seeInCurrentUrl(testUrl + paths.reasonsForAppeal.confirmation);
    });

    Then('I see the respond by date is 2 weeks in the future', async () => {
      I.seeInSource(moment().add(14,'days').format(dayMonthYearFormat));
    });

  }
};
