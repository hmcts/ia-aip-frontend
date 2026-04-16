@nightly-test
Feature: Task list

Scenario: Task List links work
  Given I am on home page
  When I have logged in for the e2e as an appellant in state "appealStarted"
  Then I should see the appeal overview page
  When I click continue
  Then I should see the task-list page
  When I click on the type-of-appeal link
  Then I should be taken to the Is the appellant in the UK page
  When I click "Back" link
  Then I expect to be redirect back to the task-list
  When I click on Home office details
  Then I should be taken to the home office ref number page
  When I click "Back" link
  Then I expect to be redirect back to the task-list
  When I click the contact details link
  Then I should be taken to the contact-details page
  When I click "Back" link
  Then I expect to be redirect back to the task-list
  When I click on the decision-type link
  Then I should be taken to the decision type page
  When I click "Back" link
  Then I expect to be redirect back to the task-list
  When I click on the fee-support link
  Then I should be taken to the fee support page
  When I click "Back" link
  Then I expect to be redirect back to the task-list
  When I click on the check and send your appeal link
  Then I should be taken to the check-and-send page
