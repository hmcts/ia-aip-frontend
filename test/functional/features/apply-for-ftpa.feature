@applyForFTPAAppellantFeature
Feature: Apply for FTPA as an appellant in person
  In order to apply for FTPA
  As a citizen
  I want to be able to apply for FTPA

  Scenario: Apply for FTPA
    Given I have logged in as an appellant in state "decided"
    When I click the Apply for permission to appeal to the Upper Tribunal link
    Then I should see the ftpa reason page

    Then I fill in the textarea with "Reason why it is wrong"
    Then I click continue
    Then I see "/ftpa-grounds" in current url
    
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
    Then I should see "Do you want to provide supporting evidence" on the page
    Then I see "/ftpa-evidence-question" in current url

    # Path with supporting evidence
    When I select Yes and click continue
    Then I see "/ftpa-evidence" in current url
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
    Then I see "/ftpa-check-answer" in current url
    Then I should see "Check your answer" on the page

    # Path with no supporting evidence
    When I select No and click continue
    Then I see "/ftpa-check-answer" in current url
    Then I should see "Check your answer" on the page

    # Common path with or without supporting evidence
    When I click "send" button
    Then I should see "Your application for permission to appeal to the Upper Tribunal has been sent" on the page
    Then I should see "A judge will look at your application and decide what will happen next" on the page

