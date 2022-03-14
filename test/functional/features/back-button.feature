Feature: Back button
  In order to navigate
  As a citizen
  I want to be able to navigate Back

  Scenario: Navigate back to task list page
    Given I am authenticated as a valid appellant
    And I click continue

    Then I see "Tell us about your appeal" in title
    And I click on the type-of-appeal link

    Then I should be taken to the appeal page
    And  I select appeal type Protection
    And I click "Save and continue" button

    Then I should see the task-list page
    And I click "Your Home Office details" link
    Then I should be taken to the home office ref number page
    When I enter "A12345" as the Office ref number and click Save and continue
    Then I should see error summary

    When I enter "1234-1234-1234-1234" as the Office ref number and click Save and continue
    Then I should see letter sent page
    When I click "Back" button
    Then I should be taken to the home office ref number page
    And I shouldnt see error summary

