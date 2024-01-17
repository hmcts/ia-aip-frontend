import moment from 'moment';
import { paths } from '../../../../app/paths';
import { dayMonthYearFormat } from '../../../../app/utils/date-utils';

module.exports = {
  appealSent(I) {
    Then('I am on the appeal details sent page', async () => {
      await I.waitInUrl(paths.appealSubmitted.confirmation, 15);
      I.seeInCurrentUrl(paths.appealSubmitted.confirmation);
    });

    Then('I am on the appeal details submitted page', async () => {
      await I.waitInUrl(paths.pendingPayment.confirmation, 15);
      await I.seeInCurrentUrl(paths.pendingPayment.confirmation);
      await I.see('You still have to Pay for your appeal.');
    });

    Then('I am on the make payment page', async () => {
      await I.waitForText('Enter card details', 20);
    });

    When('I make a successful payment', async () => {
      await I.see('Enter card details', 'h1');
      await I.fillField('#card-no','4444333322221111');
      await I.fillField('#expiry-month','10');
      await I.fillField('#expiry-year','30');
      await I.fillField('#cardholder-name','Successful payment');
      await I.fillField('#cvc','123');
      await I.fillField('#address-line-1','123 Bond Street');
      await I.fillField('#address-city','Bondsthorpe');
      await I.fillField('#address-postcode','BO0 0ND');
      await I.fillField('#email', 'test@mail.com');
      await I.click('Continue');
      await I.see('Confirm your payment', 'h1');
      await I.click('Confirm payment');
      await I.waitForText('What happens next', 60);
    });

    Then('I am on the appeal details sent with payment page', async () => {
      await I.waitInUrl(paths.common.confirmationPayment, 15);
      await I.seeInCurrentUrl(paths.common.confirmationPayment);
      I.see('Your appeal details have been sent');
      I.see('A Tribunal Caseworker will ask the Home Office to send any documents it has about your case to the Tribunal');
      I.see('A Tribunal Caseworker will check the Home Office documents and then contact you to tell you what to do next');
      I.seeInSource(moment().add(5,'days').format(dayMonthYearFormat));
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
