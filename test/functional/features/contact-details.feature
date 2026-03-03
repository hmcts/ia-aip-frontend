Feature: Contact details
  In order complete my appeal
  As a citizen
  I want to be able to enter my contact details

  Scenario: Entering my contact details should open next task
    Given I have logged in as an appellant with email "appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress@example.com"
    Then I click continue
    And I check page accessibility
    And I am on the contact details page
    When I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Decision type"
    And I check page accessibility

    Given I am on the contact details page
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see error summary

    Given I am on the contact details page
    When I enter text message number "07899999999"
    And I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I should be able to click "Decision type"
    And I check page accessibility

    Given I am on the contact details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see the enter address page
    And I see "What is your address?" in title
    When I click save and continue
    And I check page accessibility

    Then I should be taken to the has sponsor page
    Then I choose No and click Continue
    And I check page accessibility

    Then I should be taken to the has non legal rep page
    And I see "Do you have a non legal representative?" in title
    Then I choose Yes and click save and continue
    And I check page accessibility
    Then I should be taken to the non legal rep email page
    And I see "What is your non legal rep's email address?" in title
    And I click save and continue
    Then I should see error summary
    And I check page accessibility

    When I enter an invalid non legal rep email
    And I click save and continue
    Then I should see error summary

    When I enter a valid non legal rep email
    And I click save and continue

    Then I should see the task-list page
    And I should be able to click "Decision type"
    And I check page accessibility
