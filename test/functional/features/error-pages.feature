Feature: Type iof appeal
  In order complete my appeal
  As a citizen
  I want to be able to enter my type of appeal

  Scenario: Home office reference page
    Given I am authenticated as a valid appellant
    When I enter a non existent url
    Then I should see page not found error page
