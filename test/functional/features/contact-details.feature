Feature: Contact details
  In order complete my appeal
  As a citizen
  I want to be able to enter my contact details

  Scenario: Entering my contact details should open next task
    Given I have logged in as an appellant with email "appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress@example.com"
    Then I click continue
    And I check page accessibility
    And I am on the contact details page
    When I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Decision type"
    And I check page accessibility

    Given I am on the contact details page
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see error summary

    Given I am on the contact details page
    When I enter text message number "07899999999"
    And I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I should be able to click "Decision type"
    And I check page accessibility

    Given I am on the contact details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see the enter address page
    And I see "What is your address?" in title
    When I click save and continue
    And I check page accessibility

    Then I should be taken to the has sponsor or nlr page
    When I select "No" for sponsor and "Yes" for non-legal representative and click continue
    And I check page accessibility

    Then I should be taken to the non legal rep name page
    When I click the back button

    Then I should be taken to the has sponsor or nlr page
    When I select "Yes" for sponsor and "Yes" for non-legal representative and click continue

    Then I should be taken to the is sponsor and nlr the same person page
    And I check page accessibility
    When I select "No" for same person and save and continue

    Then I should be taken to the has sponsor name page
    When I click the back button

    Then I should be taken to the is sponsor and nlr the same person page
    When I select "Yes" for same person and save and continue

    Then I should be taken to the non legal rep name page
    And I check page accessibility
    And I see "What is your non-legal representative's name?" in title
    And I click save and continue
    Then I should see error summary
    And I check page accessibility
    When I enter a non legal rep name
    And I click save and continue

    Then I should be taken to the non legal rep address page
    And I check page accessibility
    And I see "What is your non-legal representative's address?" in title
    And I click save and continue
    Then I should see error summary
    And I check page accessibility
    When I enter a non legal rep address without postcode
    And I click save and continue
    Then I should see error summary
    When I enter a non legal rep address with invalid postcode
    And I click save and continue
    Then I should see error summary
    When I enter a valid non legal rep address
    And I click save and continue

    Then I should be taken to the non legal rep contact details page
    And I check page accessibility
    And I see "What are your non-legal representative's contact details?" in title
    And I click save and continue
    Then I should see error summary
    And I check page accessibility
    When I enter an invalid non legal rep email
    And I enter an invalid non legal rep phone number
    And I click save and continue
    Then I should see error summary
    When I enter a valid non legal rep email
    And I enter a valid landline non legal rep phone number
    And I click save and continue
    Then I should see error summary
    When I enter a valid non legal rep email
    And I enter a valid non legal rep phone number
    And I click save and continue

    Then I should see the task-list page
    And I should be able to click "Decision type"
    And I check page accessibility
