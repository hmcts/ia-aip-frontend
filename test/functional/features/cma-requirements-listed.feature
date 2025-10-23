@cmaRequirements
Feature: Cma Requirements Listed
  In order to complete my appeal
  As a citizen
  I want to check my cma requirements have been listed

  Scenario: Cma Requirements Listed
    Given I have logged in as an appellant in state "cmaListed"

    Then I am on the overview page
    Then I should see the date time and hearing centre in do this next
