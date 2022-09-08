@uploadAddendumEvidence
Feature: upload addendum evidence
  In order to provide addendum evidence
  As a citizen
  I want to be able to upload the evidence with reason it is late

  Scenario: Navigate through upload addendum evidence
    Given I have logged in as an appellant in state "preHearing"
    When I click the Provide more evidence link
    Then I should see the provide more evidence page

    When I click "Upload file" button
    Then I should see error summary

    When I click "Continue" button
    Then I should see error summary

    Given I choose a file that is "INVALID_TOO_BIG" and click the "Upload file" button
    Then I should see error summary

    Given I choose a file that is "INVALID_FORMAT" and click the "Upload file" button
    Then I should see error summary

    Given I choose a file that is "VALID" and click the "Upload file" button
    When I click "Continue" button
    Then I should see the why evidence late page

    When I click "Continue" button
    Then I should see error summary

    When I enter "Reason for late submission of evidence" into the why evidence late text area and click Save and Continue
    Then I should see the provide more evidence check page

    When I click "Confirm and send" button
    Then I should see the provide more evidence sent page
    Then I should see "A Tribunal judge will look at the reasons why your evidence is late and decide if the evidence can be part of your appeal." on the page
