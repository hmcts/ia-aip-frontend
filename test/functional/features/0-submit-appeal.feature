@submitAppeal
Feature: Submit appeal

  Scenario: Take case up to fee choice
    Given I have logged in as an appellant in state "appealStarted"

    Then I see "John Smith" in title
    And I see "Do this next" in subheading
    And I click "Continue" button

    Then I see "Tell us about your appeal" in title
    And I click on the type-of-appeal link
    Then I should be taken to the currently living in the United Kingdom page
    When I select Yes and click continue

    Then I should be taken to the appeal page
    And  I select appeal type Protection
    And I click "Save and continue" button

    Then I should see the task-list page
    And I click "Your Home Office and personal details" link

    Then I see "What is your Home Office reference number?" in title
    And I fill "Enter your Home Office reference number" field with "1234567"
    And I click "Save and continue" button

    Then I see "What is your name?" in title
    And I fill "Given names" field with "Pedro"
    And I fill "Family name" field with "Jimeno"
    And I click "Save and continue" button

    Then I see "What is your date of birth?" in title
    And I fill "Day" field with "10"
    And I fill "Month" field with "10"
    And I fill "Year" field with "1990"
    And I click "Save and continue" button

    Then I see "What is your nationality?" in title
    And I select "Albania" from "What is your nationality?" drop-down
    And I click "Save and continue" button

    Then I see "What date was your decision letter sent?" in title
    And I enter a a home letter date in the last 2 weeks
    And I click "Save and continue" button

    Then I see "Upload your Home Office decision letter" in title
    And I choose a file that is "VALID"
    And I click "Upload file" button
    And I click "Save and continue" button

    Then I see "Has a deportation order been made against you?" in title
    When I select Yes
    And I click "Save and continue" button

    Then I see "Tell us about your appeal" in title
    And I click "Your contact details" link

    Then I see "How do you want us to contact you?" in title
    And I check "Email" option
    And I fill "Enter email address" field with "test@test.com"
    And I click "Save and continue" button

    Then I see "What is your address?" in title
    And I click "I want to enter my address manually" link

    Then I see "What is your address?" in title
    And I fill "Building and street" field with "example street"
    And I fill "Town or city" field with "example city"
    And I fill "County" field with "example county"
    And I fill "Postcode" field with "W1W 7RT"
    And I click "Save and continue" button

    Then I see "Do you have a sponsor" in title
    When I select No and click continue

    Then I see "Tell us about your appeal" in title
    When I click "Decision with or without a hearing" link

    Then I see "How do you want your appeal to be decided" in title
    When I select I want the appeal to be decided with a hearing and click Save and continue

    Then I see "Do you want to pay for the appeal now?" in title
    When I select No, I will pay later
    And I click "Save and continue" button

    Then I see "Tell us about your appeal" in title
  @testThis
  Scenario: Submit an on time new appeal
    Given I have logged in as an appellant with email "appealUpToFeeChoice@example.com"
    Then I see "givenName familyName" in title
    And I see "Do this next" in subheading
    And I click "Continue" button

    Then I see "Tell us about your appeal" in title
    When I click "Support to pay the fee" link

    Then I see "Do you have to pay the fee?" in title
    When I choose None of these statements and click save and continue

    Then I see "Help with paying the fee" in title
    When I say I will pay for the appeal now and click save and continue

    Then I see "Tell us about your appeal" in title
    And I click "Check and send your appeal details" link

    Then I see "Check your answers" in title
#
    And I check "I believe the information I have given is true" option
    And I click "Submit" button
    Then I see "You have sent your appeal details" in title
