@nightly-test
Feature: Task list

Scenario: Task List links work
  Given I am on home page
  When I click Sign in to continue with your appeal
  Then I should see the sign in page
  When I log in as an appellant ready to submit appeal
  Then I should see the appeal overview page
  And I should see the 'do this next section' for 'New - Appeal started'
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
  When I click Your personal details
  Then I should be taken to the enter your name page
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
  When I click on the check and send your appeal link
  Then I should be taken to the check-and-send page
