@cmaRequirements
Feature: Cma Requirements
  In order to complete my appeal
  As a citizen
  I want to be able to answer cma requirements

  Scenario: Answering Cma Requirements 1
    Given I have logged in as an appellant in state "awaitingCmaRequirements"

    Then I am on the overview page
    When I click "Continue" button

    Then I should see the cma requirements task-list page

    When I click "Will you need an interpreter, step-free access or a hearing loop at the appointment?" link
    Then I see "Access needs" in title

    When I click "Continue" button
    Then I see "Will you need an interpreter?" in title
    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Add language details" in title

    When I select from the drop-down
    And I click "Save and continue" button
    Then I see "Will you or anyone coming with you need step-free access?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Will you or anyone coming with you need a hearing loop?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Tell us your appointment needs" in title

    When I click "Will you need anything else at the appointment?" link
    Then I see "Other needs" in title

    When I click "Continue" button
    Then I see "Will you bring any multimedia evidence?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Will you bring the equipment to play this evidence?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose No and click save and continue
    Then I see "Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it'"
    And I click "Save and continue" button
    Then I see "Will you need an all-female or all-male appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "What type of appointment will you need?" in title

    When I click "All male" button
    And I click "Save and continue" button
    Then I see "Tell us why you need an all-male appointment" in title

    When I click "Back" button
    Then I see "What type of appointment will you need?" in title

    When I click "All female" button
    And I click "Save and continue" button
    Then I see "Tell us why you need an all-female appointment" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Tell us why you need an all-female appointment'"
    And I click "Save and continue" button
    Then I see "Will you need a private appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Tell us why you need a private appointment" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Tell us why you need a private appointment'"
    And I click "Save and continue" button
    Then I see "Do you have any physical or mental health conditions that may affect you at the appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Tell us how any physical or mental health conditions you have may affect you at the appointment" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Tell us how any physical or mental health conditions you have may affect you at the appointment'"
    And I click "Save and continue" button
    Then I see "Have you had any past experiences that may affect you at the appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Tell us how any past experiences that may affect you at the appointment" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Tell us how any past experiences that may affect you at the appointment'"
    And I click "Save and continue" button
    Then I see "Will you need anything else at the appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Tell us what you will need and why you need it" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Tell us what you will need and why you need it'"
    And I click "Save and continue" button
    Then I see "Tell us your appointment needs" in title

    When I click "Are there any dates you cannot go to the appointment?" link
    Then I see "Are there any dates you cannot go to the appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose Yes and click save and continue
    Then I see "Enter a date" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I enter a day "1" month "1" year "1"
    And I click "Save and continue" button
    Then I should see error summary

    When I enter a valid in-range date
    And I click "Save and continue" button

    Then I see "Why can you not go to the appointment on this date?" in title
    When I click "Save and continue" button
    Then I should see error summary

    When I fill textarea with "Reason for 'Why can you not go to the appointment on this date?'"
    And I click "Save and continue" button
    Then I see "Do you want to add another date you cannot go to the appointment?" in title

    When I click "Save and continue" button
    Then I should see error summary

    When I choose No and click save and continue
    Then I see "Tell us your appointment needs" in title
    And I see "Check and send us your appointment needs" link

    When I click "Check and send us your appointment needs" link
    Then I see "Check your answers" in title
    And I see cma requirements answers and content

    When I click "Send" button
    Then I should see the cma requirements confirmation page
    And I see the respond by date is 2 weeks in the future


  Scenario: Answering Cma Requirements 2
    Given I have logged in as an appellant in state "awaitingCmaRequirements"

    Then I am on the overview page
    When I click "Continue" button

    Then I should see the cma requirements task-list page

    When I click "Will you need an interpreter, step-free access or a hearing loop at the appointment?" link
    Then I see "Access needs" in title

    When I click "Continue" button
    Then I see "Will you need an interpreter?" in title
    When I click "Save for later" button
    Then I should see the appeal overview page



  Scenario: Answering Cma Requirements 3
    Given I have logged in as an appellant in state "awaitingCmaRequirements"

    Then I am on the overview page
    When I click "Continue" button

    Then I should see the cma requirements task-list page

    When I click "Will you need an interpreter, step-free access or a hearing loop at the appointment?" link
    Then I see "Access needs" in title

    When I click "Continue" button
    When I choose Yes and click save and continue


    Then I see "Add language details" in title
    When I select from the drop-down
    And I click "Save for later" button
    Then I should see the appeal overview page

  Scenario: Answering Cma Requirements save for later
    Given I have logged in as an appellant in state "awaitingCmaRequirements"

    Then I am on the overview page
    When I click "Continue" button

    Then I should see the cma requirements task-list page

    When I click "Will you need an interpreter, step-free access or a hearing loop at the appointment?" link
    Then I see "Access needs" in title

    When I click "Continue" button
    Then I see "Will you need an interpreter?" in title

    When I choose Yes and click save and continue
    Then I see "Add language details" in title

    When I select from the drop-down
    And I click "Save and continue" button
    Then I see "Will you or anyone coming with you need step-free access?" in title

    When I choose Yes and click save and continue
    Then I see "Will you or anyone coming with you need a hearing loop?" in title

    When I click "Save for later" button
    Then I should see the appeal overview page

    When I click "Continue" button

    Then I should see the cma requirements task-list page

  Scenario: checking cma details viewer
    Given I have logged in as an appellant in state "cmaRequirementsSubmitted"
    Then I am on the overview page
    When I click "Your appointment needs" link

