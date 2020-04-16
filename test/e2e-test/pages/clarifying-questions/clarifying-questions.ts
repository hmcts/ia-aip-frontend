module.exports = {
  clarifyingQuestions(I) {
    Then(/^I see clarifying question "([^"]*)" saved$/, async (selector: string) => {
      await I.see('SAVED',`//ol/li[1]/ul/li[${selector}]/strong`);
    });
  }
};
