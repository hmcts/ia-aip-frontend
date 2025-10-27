@aip-to-lr-noc @nightly-test
Feature: Appellant in person to Legal Rep Notice of change

Scenario: Complete NoC Happy path AiP to LR
   Given I am on home page
   When I click Sign in to continue with your appeal
   Then I should see the sign in page
   When I have logged in for the e2e as an appellant in state "appealSubmitted"
   Then I should see the appeal overview page
   And I click the I am no longer representing myself link
   And I create a accessibility report for the current page

   When I log in as a Legal Rep
   And I go to Notice of Change
   And I enter the saved case reference number
   And I enter the saved first and last names
   And I complete the notice of change
   Then I should see the success screen
