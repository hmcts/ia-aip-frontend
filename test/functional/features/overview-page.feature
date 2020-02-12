Feature: Overview page
  In order complete my appeal
  As a citizen
  I want to know what stage of the appeal I am at

  Scenario: Entering task-list from overview page
    Given I am authenticated as a valid appellant
    Then I click continue
    Then I should see the task-list page
