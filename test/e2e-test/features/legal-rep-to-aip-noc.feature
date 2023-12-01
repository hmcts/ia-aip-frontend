@start-representing-yourself @lr-to-aip-noc @nightly-test
Feature: Legal Rep to Appellant in person Notice of change

Scenario: NoC Happy path LR to AiP
   Given I log in as a Legal Rep
   And I create a new case and submit it
   And I stop representing the client
   And I get the NoC required data from the sent notification
   When I visit the start-representing-yourself page
   Then I see the start-representing-yourself page content
   When I click "Start now" button
   Then I see enter case number page content
   When I enter the case reference number from notification
   And I click "Continue" button
   Then I see enter security code page content
   When I enter the security code from notification
   And I click "Continue" button
   Then I see the confirm case details page with the correct information
   When I click "Continue" button
   Then I am on the self register page
   When I enter creds and click sign in
   Then I should see the appeal overview page with the legal rep case details