@accessibility
Feature: Accessibility
  Scenario: Compile report
    When I compile the accessibility results into a json report
    Then there should be no axe violations
