/// <reference types="Cypress" />
const { given, then } = require('cypress-cucumber-preprocessor/steps');

given('I am on AIP home page', () => {
  cy.visit('https://www.google.com');

});
then('I should see a button called {string}', (button: string) => {
  // cy.get('a[role="button"]').contains(button);

});
