Feature: Back button
  In order to navigate
  As a citizen
  I want to be able to navigate Back

  Scenario: Navigate back to task list page
    Given I have logged in as an appellant in state "appealStarted"
    And I click continue
    And I check page accessibility

    Then I see "Tell us about your appeal" in title
    And I click on the type-of-appeal link
    And I check page accessibility

    Then I should be taken to the currently living in the United Kingdom page
    When I select Yes and click continue
    And I check page accessibility
    Then I should be taken to the appeal page
    And  I select appeal type Protection
    And I click "Save and continue" button
    And I check page accessibility

    Then I should see the task-list page
    And I click "Your Home Office and personal details" link
    And I check page accessibility
    Then I should be taken to the home office ref number page
    When I enter "A12345" as the Office ref number and click Save and continue
    And I check page accessibility
    Then I should see error summary

    When I enter "1234-1234-1234-1234" as the Office ref number and click Save and continue
    And I check page accessibility
    Then I should be taken to the enter your name page
    When I click "Back" button
    And I check page accessibility
    Then I should be taken to the home office ref number page
    And I shouldnt see error summary

