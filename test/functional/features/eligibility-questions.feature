Feature: Eligibility
  In know if can use the service
  As a citizen
  I want to be able to answer the eligibility questions and see if I am eligible to use the service

  Scenario: Citizen is eligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you at least 18 years old" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in the UK" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the "Are you currently a citizen of a country" eligibility page
    When I select Yes and click continue
    Then I should see the "Is anyone else in your family appealing their own Home Office decision" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing an EEA decision" eligibility page
    When I select No and click continue
    Then I should see the sign in page

  Scenario: Citizen is ineligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you at least 18 years old" eligibility page
    When I select No and click continue
    Then I should see the ineligible page

  Scenario: Citizen tries to enter eligibility questions part way through and is taken to the start
    When I go to the second eligibility question without answering the first
    Then I should see the "Are you at least 18 years old" eligibility page
