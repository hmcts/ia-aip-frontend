import i18n from '../../../../locale/en.json';

module.exports = {
  ineligibile(I) {
    Then('I should see the ineligible page', async () => {
      I.see(i18n.ineligible[0].title, 'h1');
    });
  }
};
