@smoke
Feature: Smoke Test

Scenario: Check home page and health endpoint
  Given I am on home page
  When I visit the health page
  Then I see "DOWN" on the page
