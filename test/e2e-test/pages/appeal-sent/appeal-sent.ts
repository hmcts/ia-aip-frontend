import moment from 'moment';
import { paths } from '../../../../app/paths';
import { dayMonthYearFormat } from '../../../../app/utils/date-utils';
import content from '../../../../locale/en.json';

module.exports = {
  appealSent(I) {
    Then('I am on the appeal details sent page', async () => {
      await I.waitInUrl(paths.appealSubmitted.confirmation, 15);
      I.seeInCurrentUrl(paths.appealSubmitted.confirmation);
    });

    Then('I am on the appeal details PA pay now submitted page', async () => {
      await I.waitInUrl(paths.pendingPayment.confirmation, 20);
      await I.seeInCurrentUrl(paths.pendingPayment.confirmation);
      await I.see('You have sent your appeal details', 'h1');
    });

    Then('I see You have sent your appeal details in the heading', async () => {
      await I.see('You have sent your appeal details', 'h1');
    });

    Then('I see Your appeal has been submitted in the heading', async () => {
      await I.see('Your appeal has been submitted', 'h1');
    });

    Then('I am on the appeal details non PA payment submitted page', async () => {
      await I.waitInUrl(paths.pendingPayment.confirmation, 15);
      await I.seeInCurrentUrl(paths.pendingPayment.confirmation);
      await I.see('You must pay for your appeal by');
    });

    Then('I am on the make payment page', async () => {
      await I.see('Enter card details', 'h1');
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
      await I.see('What happens next', 'h2');
    });

    Then('I am on the appeal details sent with payment page', async () => {
      await I.waitInUrl(paths.common.confirmationPayment, 15);
      await I.seeInCurrentUrl(paths.common.confirmationPayment);
      await I.see(content.pages.successPage.inTime.panel);
      await I.see(content.pages.successPage.askHomeOffice);
      await I.see(content.pages.successPage.whatToDoNext);
      await I.seeInSource(moment().add(5,'days').format(dayMonthYearFormat));
    });

    Then('I see the respond by date is 4 weeks in the future', async () => {
      await I.seeInSource(moment().add(28,'days').format(dayMonthYearFormat));
    });

    Then('I see the respond by date is 5 days in the future', async () => {
      await I.seeInSource(moment().add(5,'days').format(dayMonthYearFormat));
    });

    Then('I see the pay by date is 14 days in the future', async () => {
      await I.seeInSource(moment().add(14,'days').format(dayMonthYearFormat));
    });

    When('I click on the See your appeal progress link', async () => {
      await I.click('See your appeal progress');
      try {
        await I.waitInUrl(paths.common.overview, 30);
      } catch {
        await I.click('See your appeal progress');
        await I.waitInUrl(paths.common.overview, 30);
      }
    });
  }
};
