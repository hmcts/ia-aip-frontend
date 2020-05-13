Feature: Ask for more time page
  In order ask for more time
  As a citizen
  I want to be able to fill in why I will need extra time

  Scenario: AFMT without evidence
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit the overview page
    Then I click Ask for more time
    Then I should see the ask-for-more-time page
    When I click continue
    Then I should see error summary
    When I enter a time extensions reason
    And I click continue
    Then I should see do you want to upload evidence page
    When I select Yes and click continue
    Then I am on the evidence upload page
    When I click "Upload file" button
    Then I should see error summary
    When I choose a file that is "INVALID_TOO_BIG" and click the "Upload file" button
    Then I should see error summary
    When I choose a file that is "INVALID_FORMAT" and click the "Upload file" button
    Then I should see error summary
    When I choose a file that is "VALID" and click the "Upload file" button
    And I click continue
    Then I should see the ask for more time check you answers page
    And I should see the reasons for appeal
    When I click send
    Then I see Your request for more time has been sent screen
    When I click "See your appeal progress" button
    Then I am on the overview page

  Scenario: AFMT without evidence
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit the overview page
    Then I click Ask for more time
    Then I should see the ask-for-more-time page
    When I enter a time extensions reason
    And I click continue
    Then I should see do you want to upload evidence page
    When I select No and click continue
    Then I should see the ask for more time check you answers page
    And I should see the reasons for appeal
    When I click send
    Then I see Your request for more time has been sent screen
    When I click "See your appeal progress" button
    Then I am on the overview page
