@start-representing-yourself @lr-to-aip-noc @nightly-test
Feature: Legal Rep to Appellant in person Notice of change

Scenario: NoC Happy path LR to AiP
   Given I visit the start-representing-yourself page
   When I click start now

#   valid AAT/preview-AAT reference and access code until 30 Dec 2022
   And I enter the case reference number `1669775244030851`
   And I enter the access code `G9628F2ERFMN`

   Then I should see the name Random User and the case number `1669-7752-4403-0851`
   When I complete the case details page
   Then I am on the self register page
