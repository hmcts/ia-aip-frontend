import { paths } from '../../../../app/paths';
const config = require('config');

const testUrl = config.get('testUrl');

module.exports = {
  sponsorAddress(I) {
    Given('I should be taken to the has sponsor address page', async () => {
      I.amOnPage(testUrl + paths.appealStarted.sponsorAddress);
    });

    When(/^I enter sponsor building and street "([^"]*)", Town or city "([^"]*)", Postcode "([^"]*)"$/, async (building, town, postcode) => {
      I.fillField('#address-line-1', building);
      I.fillField('#address-town', town);
      I.fillField('#address-postcode', postcode);
    });
  }
};
