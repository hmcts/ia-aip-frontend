@start-representing-yourself @lr-to-aip-noc @nightly-test
Feature: Legal Rep to Appellant in person Notice of change

Scenario: NoC Happy path LR to AiP
   Given I visit the start-representing-yourself page
   When I click start now

#   valid AAT/preview-AAT reference and access code until 29 Dec 2022
   And I enter the case reference number `1669731179736061`
   And I enter the access code `HDRW39E9PW36`

   And I complete the case details page
   Then I am on the self register page
   When I enter creds and click sign in

#   valid AAT/preview-AAT appeal reference until 29 Dec 2022
   Then I should see the appeal reference `DC/51962/2022`
