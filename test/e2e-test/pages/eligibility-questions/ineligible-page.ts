module.exports = {
  ineligibile(I) {
    Then('I should see the ineligible page', async () => {
      I.seeInSource('ineligible');
    });
  }
};
