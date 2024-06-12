@crossbrowser
Feature: Eligibility
  In know if can use the service
  As a citizen
  I want to be able to answer the eligibility questions and see if I am eligible to use the service

  @nightly-test
  Scenario: Citizen was once a british citizen and is eligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing a Revocation of Protection Status or Deprivation of Citizenship decision" eligibility page
    When I select Yes and click continue
    Then I should see the eligible page

  @nightly-test
  Scenario: Citizen is ineligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select Yes and click continue
    Then I should see the ineligible page

  @nightly-test
  Scenario: Citizen tries to enter eligibility questions part way through and is taken to the first question
    When I go to the second eligibility question without answering the first
    Then I should see the "Are you currently in detention" eligibility page

  @nightly-test
  Scenario: Citizen tries to go to eligible page without answering questions is taken to first question
    When I go to eligible page without answering the questions
    Then I should see the "Are you currently in detention" eligibility page

  @nightly-test
  Scenario: Citizen can click back on an question page to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing a Revocation of Protection Status or Deprivation of Citizenship decision" eligibility page
    When I click "Back" button
    Then I should see the "Are you currently in detention" eligibility page
    When I select Yes and click continue
    Then I should see the ineligible page

  @nightly-test
  Scenario: Citizen can click back on an ineligible page to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select Yes and click continue
    Then I should see the ineligible page
    When I click "Back" button
    Then I should see the "Are you currently in detention" eligibility page

  @nightly-test
  Scenario: Citizen can click back on an eligible page to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing a Revocation of Protection Status or Deprivation of Citizenship decision" eligibility page
    When I select Yes and click continue
    Then I should see the eligible page
    When I click "Back" button
    Then I should see the "Are you appealing a Revocation of Protection Status or Deprivation of Citizenship decision" eligibility page
    When I select No and click continue
    Then I should see the "There is a fee for this appeal" eligibility page
    When I click "Back" button
    Then I should see the "Are you appealing a Revocation of Protection Status or Deprivation of Citizenship decision" eligibility page

  @nightly-test
  Scenario: Citizen can continue already started appeal
    Given I am on home page
    When I click "Sign in to continue with your appeal" button
    Then I should see the sign in page
