@updateHearingRequirementsFeature
Feature: Make Application to update hearing requirements
  In order to update hearing requirements for my hearing
  As a citizen
  I want to be able to make an application to update hearing requirements

  Scenario: Make an Application to update hearing requirements
    Given I have logged in as an appellant in state "preHearing"
    When I click the Ask to change your hearing date location or needs link
    Then I should see the Ask to change something about your hearing page

    When I select I want to ask for something at the hearing and click continue
    Then I see "/ask-update-hearing-requirements" in current url

    Then I fill textarea with "What I need at the hearing and why"
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

