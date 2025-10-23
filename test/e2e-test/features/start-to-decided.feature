@nightly-test
Feature: Start to decided with accessibility reports

Scenario: Create appeal and force case through to decided
  Given I am on home page
  When I have WIP logged in as an appellant in state "decided"
  Then I should see the appeal overview page

  # Appellant
  And I see "A judge has allowed your appeal." description in overview banner
  When I click "Read the Decision and Reasons document" link
  Then I see "Decision and Reasons" in title
