Feature: Personal details nationality page
  In order complete my appeal
  As a citizen
  I want to be able to nationality

  Scenario: Home office reference page
    Given I have an appeal with home office details, name and date of birth
    And I have logged in
    And I am on the personal details nationality page
    When I click Save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"

    Given I am on the personal details nationality page
    When I click Save and continue
    Then I should see error summary

    Given I am on the personal details nationality page
    When I enter a nationality "Armenia"
    And I click Save for later
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"

    Given I am on the personal details nationality page
    When I enter a nationality "Armenia"
    And I click Save and continue
    Then I should see the enter postcode page

