Feature: Personal details name page
  In order complete my appeal
  As a citizen
  I want to be able to enter my name

  Scenario: Home office reference page
    Given I have an appeal with home office details
    And I have logged in
    And I am on the personal details name page
    When I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"

    Given I am on the personal details name page
    And I click save and continue
    Then I should see error summary

    Given I am on the personal details name page
    When I enter given name "Bob" family name "Smith"
    And I click save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"

    Given I am on the personal details name page
    When I enter given name "Bob" family name "Smith"
    And I click save and continue
    Then I should see the date of birth page
