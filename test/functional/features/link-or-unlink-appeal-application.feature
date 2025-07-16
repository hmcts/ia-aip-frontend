@linkOrUnlinkAppealFeature
Feature: Make Application to link or unlink an appeal
  In order to link or unlink an appeal
  As a citizen
  I want to be able to make an application to link or unlink an appeal

  Scenario: Make an Application to link or unlink an appeal
    Given I have logged in as an appellant in state "preHearing"
    When I click the Ask to link or unlink with another appeal link
    Then I should see the Ask to link or unlink this appeal page

    Then I fill textarea with "Which appeal do you want to link to or unlink from and why"
    Then I click continue
    Then I see "/supporting-evidence" in current url



    # Path with no supporting evidence
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Back" link
    Then I see "/supporting-evidence" in current url 

    # Path with supporting evidence
    When I select Yes and click continue
    Then I should see "Provide supporting evidence" on the page

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
    Then I see "/check-answer" in current url
    Then I should see "Check your answer" on the page

    # Common path with or without supporting evidence
    When I click "send" button
    Then I should see "Your request has been sent to the Tribunal" on the page
    Then I should see "The Tribunal should contact you within five working days to tell you if it will grant or refuse your request but it might take longer than that" on the page

