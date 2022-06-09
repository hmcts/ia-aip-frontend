@whyEvidenceLate
Feature: why evidence late
  In order to provide reason why evidence late
  As a citizen
  I want to be able to fill in the whyEvidenceLate text area

  Scenario: Navigate through why evidence late
    Given I have logged in as an appellant in state "decision"
    When I click "Provide more evidence" link
    Then I should see the provide more evidence page

    When I click "Upload file" button
    Then I should see error summary

    When I click "Continue" button
    Then I should see error summary

    When I choose a file that is "INVALID_TOO_BIG" and click the "Upload file" button
    Then I should see error summary

    When I choose a file that is "INVALID_FORMAT" and click the "Upload file" button
    Then I should see error summary

    When I choose a file that is "VALID" and click the "Upload file" button
    And I click "Continue" button
    Then I should see the why evidence late page

    When I click "Continue" button
    Then I should see error summary

    Then I fill "whyEvidenceLate" with "Reason for late submission of evidence"
    Then I click continue
    Then I should see the provide more evidence check page

    When I click "Confirm and send" button
    Then I should see the provide more evidence sent page
    Then I see "A Tribunal judge will look at the reasons why your evidence is late and decide if the evidence can be part of your appeal." on the page
