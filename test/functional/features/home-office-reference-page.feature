Feature: Home office reference page 3
  In order complete my appeal
  As a citizen
  I want to be able to enter a home office reference number

  Scenario: Entering a Home Office reference number
    Given I have logged in as an appellant in state "appealStarted"
    And I am on the home office reference page
    When I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"
    And I check page accessibility

    Given I am on the home office reference page
    When I enter a home office reference "A12345"
    And I click "Save for later" button
    And I check page accessibility
    Then I should see error summary

    Given I am on the home office reference page
    When I enter a home office reference "A12345"
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see error summary

    Given I am on the home office reference page
    When I enter a home office reference "1234-1234-1234-1234"
    And I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"
    And I check page accessibility

