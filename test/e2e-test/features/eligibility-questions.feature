@smoke
Feature: Eligibility
  In know if can use the service
  As a citizen
  I want to be able to answer the eligibility questions and see if I am eligible to use the service

  Scenario: Citizen was once a british citizen and is eligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently living in the United Kingdom" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing an Asylum and/or Humanitarian Protection decision" eligibility page
    When I select Yes and click continue
    Then I should see the eligible page
    When I click "Back" button
    Then I should see the "Are you appealing an Asylum and/or Humanitarian Protection decision" eligibility page

  Scenario: Citizen is ineligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently living in the United Kingdom" eligibility page
    When I select No and click continue
    Then I should see the ineligible page

  Scenario: Citizen tries to enter eligibility questions part way through and is taken to the first question
    When I go to the second eligibility question without answering the first
    Then I should see the "Are you currently living in the United Kingdom" eligibility page

  Scenario: Citizen tries to go to eligible page without answering questions is taken to first question
    When I go to eligible page without answering the questions
    Then I should see the "Are you currently living in the United Kingdom" eligibility page

  Scenario: Citizen can click back to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently living in the United Kingdom" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in detention" eligibility page
    When I click "Back" button
    Then I should see the "Are you currently living in the United Kingdom" eligibility page

  Scenario: Citizen can click back on in ineligible page to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently living in the United Kingdom" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in detention" eligibility page
    When I select Yes and click continue
    Then I should see the ineligible page
    When I click "Back" button
    Then I should see the "Are you currently in detention" eligibility page


  Scenario: Citizen can continue already started appeal
    Given I am on home page
    When I click "Sign in to continue with your appeal" button
    Then I should see the sign in page
