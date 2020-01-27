Feature: Eligibility
  In know if can use the service
  As a citizen
  I want to be able to answer the eligibility questions and see if I am eligible to use the service

  Scenario: Citizen was once a british citizen and is eligible to use the service
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
    Then I should see the "Is anyone else in your immediate family appealing their own Home Office decision" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing a European Economic Area (EEA) decision?" eligibility page
    When I select No and click continue
    Then I should see the "Have you ever been a British citizen" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you appealing the removal of your British citizenship" eligibility page
    When I select No and click continue
    Then I should see the eligible page
    When I click Back button
    Then I should see the "Are you appealing the removal of your British citizenship" eligibility page

  Scenario: Citizen was never a british citizen and is eligible to use the service
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
    Then I should see the "Is anyone else in your immediate family appealing their own Home Office decision" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing a European Economic Area (EEA) decision" eligibility page
    When I select No and click continue
    Then I should see the "Have you ever been a British citizen" eligibility page
    When I select No and click continue
    Then I should see the eligible page
    When I click Back button
    Then I should see the "Have you ever been a British citizen" eligibility page

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

  Scenario: I have come back to complete an appeal
    When I click the start now button
    Then I should see "Are you at least 18 years old?" questions page


  Scenario: I have come back to complete an appeal
    When I click the sign in and continue link
    Then I should see "Sign in" on login page
