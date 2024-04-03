Feature: Type iof appeal
  In order complete my appeal
  As a citizen
  I want to be able to enter my type of appeal

  Scenario: Home office reference page
    Given I have logged in as an appellant in state "appealStarted"
    When I enter a non existent url
    Then I should see page not found error page
