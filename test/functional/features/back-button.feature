Feature: Back button
  In order to navigate
  As a citizen
  I want to be able to navigate Back

  Scenario: Navigate back to task list page
    Given I am authenticated as a valid appellant
    And I click continue
    And I click "Your Home Office details" link
    Then I should be taken to the home office ref number page
    When I enter "A12345" as the Office ref number and click Save and continue
    Then I should see error summary

    When I enter "1234-1234-1234-1234" as the Office ref number and click Save and continue
    Then I should see letter sent page
    When I click "Back" button
    Then I should be taken to the home office ref number page
    And I shouldnt see error summary

