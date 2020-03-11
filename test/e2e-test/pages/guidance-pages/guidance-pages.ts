import { paths } from '../../../../app/paths';

module.exports = {
  guidancePages(I) {

    Then(/^I should see the 'Tribunal Caseworker' guidance page$/, async () => {
      await I.seeInCurrentUrl(paths.guidancePages.tribunalCaseworker);
      await I.see('What is a Tribunal Caseworker?', 'h1');
    });

    Then(/^I should see the 'Understanding your Home Office documents' guidance page$/, async () => {
      await I.seeInCurrentUrl(paths.guidancePages.homeOfficeDocuments);
      await I.see('Understanding your Home Office documents', 'h1');
    });

  }
};
