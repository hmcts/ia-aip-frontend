Feature: Personal details enter address
  In order complete my appeal
  As a citizen
  I want to be able to enter my address

  Scenario: Entering my address should open next task
    Given I have logged in as an appellant with email "appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal@example.com"
    And I am on the personal details enter address page
    When I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Decision type"
    And I check page accessibility

    Given I am on the personal details enter address page
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see error summary

    Given I am on the personal details enter address page
    When I enter building and street "1 Some way", Town or city "Nowhere", Postcode "CM15 8BN"
    And I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Decision type"
    And I check page accessibility

    Given I am on the personal details enter address page
    When I enter building and street "1 Some way", Town or city "Nowhere", Postcode "CM15 8BN"
    And I click "Save and continue" button
    And I check page accessibility
    And I should be taken to the has sponsor page
    Then I see "Do you have a sponsor?" in title
    When I select No and click continue
    And I check page accessibility
    Then I should see the task-list page
    And I should be able to click "Decision type"
    And I check page accessibility
