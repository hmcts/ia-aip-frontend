@nightly-test
Feature: Case list

Scenario: Case list functionality works
  Given I am on home page
  When I have logged in for the e2e case list
  Then I should see the cases list page
  And I should see "You do not have any appeals." message
  And I should see "Create a new appeal" link

  When I click "Create a new appeal" link
  Then I should see the confirm create appeal popup
  When I click cancel on the confirm create appeal popup
  Then I should see the cases list page
  When I click "Create a new appeal" link
  Then I should see the confirm create appeal popup
  When I click confirm on the confirm create appeal popup
  Then I should see the appeal overview page
  And I see "Do this next" in subheading

  When I click the "Back to cases list" link
  Then I should see the cases list page
  When I refresh the appeal list
  Then I should see a table with 1 appeal
  And I should see appeal reference "DRAFT" in the table
  And I should see status "DRAFT" for appeal "DRAFT"
  And I should see "View" link for the appeal
  And I should see "Delete" link for appeal "DRAFT"

  When I click "View" link for appeal "DRAFT"
  Then I should see the appeal overview page

  When I visit the cases list page
  And I create a new draft appeal "4" times
  And I visit the cases list page
  Then I should see a table with 5 appeals

  When I create a new draft appeal
  Then I should see the case list with the "tooManyDrafts" error

  When I grab a draft appeal at random
  And I click "Delete" link for the grabbed appeal
  Then I should see the confirm delete draft popup with case id matching the grabbed appeal
  When I click cancel on the confirm delete draft popup
  Then I should see the cases list page
  And I click "Delete" link for the grabbed appeal
  Then I should see the confirm delete draft popup with case id matching the grabbed appeal
  When I click confirm on the confirm delete draft popup
  Then I should see the cases list page
  And I should see a table with 4 appeals
  And I should not see the grabbed appeal in the table

  When I go to view the grabbed appeal
  Then I should see the cases list page
  And I should see the case list with the "caseNotFound" error
