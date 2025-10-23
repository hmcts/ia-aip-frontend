Feature: Error pages
  In order complete my appeal
  As a citizen
  I want to be able to enter my type of appeal

  Scenario: Page not found
    Given I have logged in as an appellant in state "appealStarted"
    When I enter a non existent url
    Then I should see page not found error page

  Scenario: Check file not found page
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit a non-existent document
    Then I should see the no file found page
