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

    When I click "Confirm and send" button
    Then I see "/ftpa-confirmation" in current url

    When I click "See your appeal progress" link
    Then I am on the overview page
    Then I see "A judge will decide your application for permission to appeal to the Upper Tribunal." on the page

