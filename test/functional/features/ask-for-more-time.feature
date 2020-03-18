Feature: Ask for more time page
  In order ask for more time
  As a citizen
  I want to be able to fill in why I will need extra time

  Scenario: AFMT started
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit the overview page
    Then I I navigate to Ask for more time page
    Then I should see the ask-for-more-time page
    When I click save and continue
    Then I should see error summary
