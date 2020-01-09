Feature: Personal details date of birth page
  In order complete my appeal
  As a citizen
  I want to be able to enter date of birth

  Scenario: Home office reference page
    Given I have an appeal with home office details and name
    And I have logged in
    And I am on the personal details date of birth page
    When I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"

    Given I am on the personal details date of birth page
    When I enter a day "1" month "1" year "1"
    And I click save for later
    Then I should see error summary

    Given I am on the personal details date of birth page
    When I enter a day "1" month "1" year "1"
    And I click save and continue
    Then I should see error summary

    Given I am on the personal details date of birth page
    When I enter a day "1" month "1" year "1981"
    And I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"

    Given I am on the personal details date of birth page
    When I enter a day "1" month "1" year "1981"
    And I click save and continue
    Then I should see the nationality page

