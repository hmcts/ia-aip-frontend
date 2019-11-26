Feature: Business rules
  In order to achieve my goals
  As a person
  I want be able to sign in

  Scenario: Sign into form
    Given I have a defined step
    When I click start now
    Then I should see the sign in page
    When I enter creds and click sign in
    Then I should see the task-list page
    When I click on Home office details
    Then I should be taken to the home office ref number page
    When I enter "A1234567" and click Save and Continue
    Then I should see letter sent page
    When I enter a date before expiry
    Then I expect to be redirect back to the task-list

