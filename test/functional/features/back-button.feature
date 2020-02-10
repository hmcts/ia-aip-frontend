Feature: Back button
  In order to navigate
  As a citizen
  I want to be able to navigate Back

  Scenario: Navigate back to task list page
    Given I am authenticated as a valid appellant
    Then I click continue
    When I click on Home office details
    Then I should be taken to the home office ref number page
    When I enter "A12345" as the Office ref number and click Save and continue
    Then I should see error summary

    When I enter "A1234567" as the Office ref number and click Save and continue
    Then I should see letter sent page
    When I click "Back" button
    Then I should be taken to the home office ref number page
    And I shouldnt see error summary

