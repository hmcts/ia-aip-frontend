Feature: Reason for appeal file not found
  Check file not found page

  Scenario: Check file not found page
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit a non-existent document
    Then I should see the no file found page


