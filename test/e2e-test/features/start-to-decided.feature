@nightly-test
Feature: Decided

Scenario: View granted appeal as appellant
  Given I am on home page
  When I have logged in for the e2e as an appellant in state "decided"
  Then I should see the appeal overview page

  # Appellant
  And I see "A judge has allowed your appeal." description in overview banner
  And I check page accessibility
  When I click "Read the Decision and Reasons document" link
  And I check page accessibility
  Then I see "Decision and Reasons" in title

Scenario: View dismissed appeal as appellant
  Given I am on home page
  When I have logged in for the e2e as an appellant in state "decided-dismissed"
  Then I should see the appeal overview page

  # Appellant
  And I see "A judge has dismissed your appeal." description in overview banner
  When I click "Read the Decision and Reasons document" link
  And I check page accessibility
  Then I see "Decision and Reasons" in title
