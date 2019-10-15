/// <reference types="Cypress" />
import {} from 'cypress';

context('Run e2e happy path', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('.testing-class');
    cy.get('p').contains('Hello from the OTHER world!!!');
  });

  it('Should run e2e and check page elements.', () => {
    cy.get('#firstName').click().type('Lewis');
    cy.get('#lastName').click().type('Williams');
    cy.get('.govuk-button').click();
    cy.wait(3000);
    cy.url().should('include','/testPost');
    cy.get('p').contains('Lewis');
    cy.get('.govuk-back-link').click();
    cy.url().should('include','/');
  });

  it('Should run error messages', () => {
    cy.get('#firstName').click().type('Joe');
    cy.get('#lastName').click().type('Williams');
    cy.get('.govuk-button').click();
    cy.wait(3000);
    cy.get('.govuk-error-summary').contains('Dont enter first name as \'Joe\'');
  });
});
