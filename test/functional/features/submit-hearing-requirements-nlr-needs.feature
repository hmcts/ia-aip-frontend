Feature: NLR needs
  In order to submit my hearing requirements
  As a citizen
  I want to be able to fill in my non-legal representative's needs

  Scenario: Non-legal representative not joined appeal
    Given I have logged in as an appellant with email "submitHearingRequirementsAccessNeedsCompletedWithNoActiveNlr@example.com"
    When I click continue
    Then I see "Tell us what you will need at the hearing" in title
    And I should see the "Will you or any witnesses need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should not see the "Non-legal representative" task sub title in the task list
    And I should not see the "Will your non-legal representative attend the hearing?" task in "To do" state
    And I should see the "Will you need anything else at the hearing?" task in "To do" state

  Scenario: Navigate non-legal representative needs first section
    Given I have logged in as an appellant with email "submitHearingRequirementsAccessNeedsCompleted@example.com"
    When I click continue
    Then I see "Tell us what you will need at the hearing" in title
    And I check page accessibility
    And I should see the "Will you or any witnesses need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should see the "Non-legal representative" task sub title in the task list
    And I should see the "Will your non-legal representative attend the hearing?" task in "To do" state
    And I should see the "Will you need anything else at the hearing?" task in "Cannot start yet" state

    When I click "Will your non-legal representative attend the hearing?" link
    Then I see "Will your non-legal representative attend the hearing?" in title
    And I check page accessibility

    When I click save and continue
    Then I should see error "Select Yes if your non-legal representative will be coming to the hearing"
    And I check page accessibility

    When I choose No and click save and continue
    Then I see "Will your non-legal representative take part in the hearing from outside the UK?" in title
    And I see "If you answer yes, a Tribunal Caseworker will contact you to ask for more information about where your non-legal representative will be for the hearing." as hint text
    And I check page accessibility
    When I click save and continue
    Then I should see error "Select Yes if your non-legal representative will take part in the hearing from outside the UK"
    And I check page accessibility

    When I choose No and click save and continue
    Then I see "Tell us what you will need at the hearing" in title
    And I should see the "Will you or any witnesses need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative attend the hearing?" task in "Saved" state
    And I should see the "Will you need anything else at the hearing?" task in "To do" state

    When I click "Will your non-legal representative attend the hearing?" link
    Then I see "Will your non-legal representative attend the hearing?" in title

    When I choose Yes and click save and continue
    Then I see "Tell us what you will need at the hearing" in title
    And I should see the "Will you or any witnesses need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative attend the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative need an interpreter, step-free access or a hearing loop at the hearing?" task in "To do" state
    And I should see the "Will you need anything else at the hearing?" task in "Cannot start yet" state

    When I click "Will your non-legal representative attend the hearing?" link
    Then I see "Will your non-legal representative attend the hearing?" in title

    When I choose No and click save and continue
    Then I see "Will your non-legal representative take part in the hearing from outside the UK?" in title

    When I choose Yes and click save and continue
    Then I see "Tell us what you will need at the hearing" in title
    And I should see the "Will you or any witnesses need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative attend the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative need an interpreter, step-free access or a hearing loop at the hearing?" task in "To do" state
    And I should see the "Will you need anything else at the hearing?" task in "Cannot start yet" state

  Scenario: Navigate non-legal representative needs second section
    Given I have logged in as an appellant with email "submitHearingRequirementsAccessNeedsCompletedWithNlrAttending@example.com"
    When I click continue
    Then I see "Tell us what you will need at the hearing" in title
    When I click "Will your non-legal representative need an interpreter, step-free access or a hearing loop at the hearing?" link
    Then I see "Communication and access support" in title
    And I see "Use this form if your non-legal representative needs to request:" as a "p" element
    And I see "an interpreter for translating spoken language" as a "li" element
    And I see "an interpreter for sign language" as a "li" element
    And I see "step-free access" as a "li" element
    And I see "a hearing loop" as a "li" element
    And I see "They will be provided at the hearing." as a "p" element
    And I check page accessibility

    When I click continue
    Then I see "Will your non-legal representative need an interpreter at the hearing?" in title
    Then I see "We will provide an interpreter for your non-legal representative. They cannot bring your own." as hint text
    And I check page accessibility

    When I click save and continue
    Then I should see error "Select Yes if your non-legal representative will need an interpreter at the hearing"
    And I check page accessibility

    When I choose No and click save and continue
    Then I see "Will your non-legal representative need step-free access?" in title
    Then I see "If your non-legal representative is in a wheelchair or has any other mobility issues, we will provide step-free access at the hearing." as hint text
    And I check page accessibility

    When I click save and continue
    Then I should see error "Select Yes if your non-legal representative will need a step-free access"
    And I check page accessibility

    When I choose No and click save and continue
    Then I see "Will your non-legal representative need a hearing loop?" in title
    Then I see "A hearing loop is a sound system designed to help people who use hearing aids." as hint text
    And I check page accessibility

    When I click save and continue
    Then I should see error "Select Yes if your non-legal representative will need a hearing loop"
    And I check page accessibility

    When I choose No and click save and continue
    Then I see "Tell us what you will need at the hearing" in title
    And I should see the "Will you or any witnesses need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative attend the hearing?" task in "Saved" state
    And I should see the "Will your non-legal representative need an interpreter, step-free access or a hearing loop at the hearing?" task in "Saved" state
    And I should see the "Will you need anything else at the hearing?" task in "To do" state

    When I click "Will your non-legal representative need an interpreter, step-free access or a hearing loop at the hearing?" link
    Then I see "Communication and access support" in title

    When I click continue
    Then I see "Will your non-legal representative need an interpreter at the hearing?" in title

    When I choose Yes and click save and continue
    Then I should see the what type of interpreter nlr page
    And I check page accessibility

    When I click save and continue
    Then I should see error "You must select at least one kind of interpreter"
    And I check page accessibility

    When I check "I need a spoken language interpreter" option
    And I click save and continue
    Then I see "Tell us about your non-legal representative's language requirements" in title

    When I click the back button
    Then I see "What kind of interpreter do you need to request for your non-legal representative?" in title

    When I check "I need a sign language interpreter" option
    And I uncheck "I need a spoken language interpreter" option
    When I click save and continue
    Then I see "Tell us about your non-legal representative's sign language requirements" in title

    When I click the back button
    Then I see "What kind of interpreter do you need to request for your non-legal representative?" in title

    And I check "I need a spoken language interpreter" option
    When I click save and continue
    Then I see the nlr spoken interpreter details page
    And I check page accessibility

    When I click save and continue
    And I should see error "Please select the language you need to request"
    And I should not see "Enter the details of the language you need to request for your non-legal representative" on the page

    When I check the "Enter the language manually" option
    Then I should see "Enter the details of the language you need to request for your non-legal representative" on the page
    And I select "Berber" from the "languageRefData" drop-down
    And I click save and continue
    Then I should see error "Please enter the detail of the language you need to request"
    And I should see error "Fill in only one field"

    When I uncheck "Enter the language manually" option
    Then I should not see "Enter the details of the language you need to request for your non-legal representative" on the page

    When I click save and continue
    Then I see the nlr sign interpreter details page
    And I check page accessibility

    When I click save and continue
    And I should see error "Please select the language you need to request"
    And I should not see "Enter the details of the language you need to request for your non-legal representative" on the page

    When I check the "Enter the language manually" option
    Then I should see "Enter the details of the language you need to request for your non-legal representative" on the page
    And I select "Deaf Relay" from the "languageRefData" drop-down
    And I click save and continue
    Then I should see error "Please enter the detail of the language you need to request"
    And I should see error "Fill in only one field"

    When I uncheck "Enter the language manually" option
    Then I should not see "Enter the details of the language you need to request for your non-legal representative" on the page

    When I click save and continue
    Then I see "Will your non-legal representative need step-free access?" in title

    When I choose Yes and click save and continue
    Then I see "Will your non-legal representative need a hearing loop?" in title

    When I choose Yes and click save and continue
    Then I see "Tell us what you will need at the hearing" in title
