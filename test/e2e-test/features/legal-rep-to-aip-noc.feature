@start-representing-yourself
Feature: Legal Rep to Appellant in person Notice of change

Scenario: Complete NoC Happy path
   Given I visit the start-representing-yourself page
   When I click start now
#   valid until 30 Nov 2022
   And I enter the case reference number `1662946993256131`
   And I enter the access code `9V4LGMTA3CP4`
   And I complete the case details page
   Then I am on the self register page