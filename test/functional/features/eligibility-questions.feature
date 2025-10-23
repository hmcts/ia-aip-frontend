Feature: Eligibility
  In know if can use the service
  As a citizen
  I want to be able to answer the eligibility questions and see if I am eligible to use the service

  Scenario: Citizen was once a british citizen and is eligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the eligible page

  Scenario: Citizen is ineligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you currently in detention" eligibility page
    When I select Yes and click continue
    Then I should see the ineligible page

  Scenario: Citizen can continue already started appeal
    Given I am on home page
    When I click "Sign in to continue with your appeal" button
    Then I should see the sign in page
