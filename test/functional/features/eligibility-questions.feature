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
    Then I should see the eligible page
    When I click Back button
    Then I should see the "Are you appealing an EEA decision" eligibility page

  Scenario: Citizen is ineligible to use the service
    Given I am on home page
    When I click start now
    Then I should see the "Are you at least 18 years old" eligibility page
    When I select No and click continue
    Then I should see the ineligible page

  Scenario: Citizen tries to enter eligibility questions part way through and is taken to the first question
    When I go to the second eligibility question without answering the first
    Then I should see the "Are you at least 18 years old" eligibility page

  Scenario: Citizen tries to go to eligible page without answering questions is taken to first question
    When I go to eligible page without answering the questions
    Then I should see the "Are you at least 18 years old" eligibility page

  Scenario: Citizen can click back to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you at least 18 years old" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in the UK" eligibility page
    When I click Back button
    Then I should see the "Are you at least 18 years old" eligibility page

  Scenario: Citizen can click back on in ineligible page to change answer to previous question
    Given I am on home page
    When I click start now
    Then I should see the "Are you at least 18 years old" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in the UK" eligibility page
    When I select No and click continue
    Then I should see the ineligible page
    When I click Back button
    Then I should see the "Are you currently in the UK" eligibility page
