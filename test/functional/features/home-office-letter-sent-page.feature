Feature: Home office letter sent page
  In order complete my appeal
  As a citizen
  I want to be able to enter a home office letter sent date

  Scenario: Home office reference page
    Given I am authenticated as a valid appellant
    And I am on the home office letter sent page
    When I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click Personal details

    Given I am on the home office letter sent page
    When I enter a day "1" month "1" year "1"
    And I click save for later
    Then I should see error summary

    Given I am on the home office letter sent page
    When I enter a day "1" month "1" year "1"
    And I click save and continue
    Then I should see error summary

    Given I am on the home office letter sent page
    When I enter a a home letter date in the last 2 weeks
    And I click save for later
    Then I should see the task-list page
    And I should be able to click Personal details

