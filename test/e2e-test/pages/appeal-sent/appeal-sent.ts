import moment from 'moment';
import { paths } from '../../../../app/paths';

module.exports = {
  appealSent(I) {
    Then('I am on the appeal details sent page', async () => {
      I.seeInCurrentUrl(paths.confirmation);
    });

    Then('I see the respond by date is 4 weeks in the future', async () => {
      I.seeInSource(moment().add(28,'days').format('DD MMMM YYYY'));
    });
  }
};
