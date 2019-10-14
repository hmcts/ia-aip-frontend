/// <reference types="Cypress" />

context('Run e2e happy path', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  });

  it('Should run e2e and check page elements.', () => {
    cy.get('.testing-class');
    cy.get('p').contains('Hello from the OTHER world!!!');
    cy.get('.govuk-button').click();
    cy.url().should('include','/testPost');
    cy.get('.govuk-back-link').click();
    cy.url().should('include','/');
  })
});
