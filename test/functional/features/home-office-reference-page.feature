Feature: Home office reference page
  In order complete my appeal
  As a citizen
  I want to be able to enter a home office reference number

  Scenario: Home office reference page
    Given I have logged in
    And I am on the home office reference page
    When I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click Personal details

    Given I am on the home office reference page
    When I enter a home office reference "A12345"
    And I click save for later
    Then I should see error summary

    Given I am on the home office reference page
    When I enter a home office reference "A12345"
    And I click save and continue
    Then I should see error summary

    Given I am on the home office reference page
    When I enter a home office reference "A1234567"
    And I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click Personal details

