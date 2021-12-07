@submitAppeal
Feature: Home office reference page 
  In order complete my appeal
  As a citizen
  I want to be able to enter a home office reference number

  Background:
    Given I have logged in
    
    Then I see "John Smith" in title
    And I see "Do this next" in subheading
    And I click "Continue" button

    Then I see "Tell us about your appeal" in title
    And I click "Your Home Office details" link

    Then I see "What is your Home Office reference number?" in title
    And I fill "Enter your Home Office reference number" field with "1234567"
    And I click "Save and continue" button

    Then I see "What date was your decision letter sent?" in title
    And I enter a a home letter date in the last 2 weeks
    And I click "Save and continue" button

    Then I see "Upload your Home Office decision letter" in title
    And I choose a file that is "VALID"
    And I click "Upload file" button
    And I click "Save and continue" button

    Then I see "Tell us about your appeal" in title
    And I click "Your personal details" link

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

    Then I see "What is your address?" in title
    And I click "I want to enter my address manually" link

    Then I see "What is your address?" in title
    And I fill "Building and street" field with "example street"
    And I fill "Town or city" field with "example city"
    And I fill "County" field with "example county"
    And I fill "Postcode" field with "W1W 7RT"
    And I click "Save and continue" button

    Then I see "Tell us about your appeal" in title
    And I click "Your contact details" link

    Then I see "How do you want us to contact you?" in title
    And I check "Email" option
    And I fill "Enter email address" field with "test@test.com"
    And I click "Save and continue" button

    Then I see "Tell us about your appeal" in title
    And I click on Appeal and decision type link

    Then I see "What is your appeal type?" in title
    And I check "Protection (You will be persecuted or harmed in some way if you are returned to your home country)" option
    And I click "Save and continue" button

    Then I should see the decision type page
    Then I select decision type without hearing
    And I click "Save and continue" button
    Then I should be taken to the payment options page
    When I select No for pay for the appeal now
    And I click "Save and continue" button

    Then I see "Tell us about your appeal" in title
    And I click "Check and send your appeal details" link

    Then I see "Check your answer" in title

  Scenario: Submit an on time new appeal
    And I check "I believe the information I have given is true" option
    And I click "Send" button
    Then I see "You have sent your appeal details" in title

  Scenario: Submit an out of time appeal
    And I click "Date letter sent" change link
    Then I see "What date was your decision letter sent?" in title

    And I fill "Day" field with "10"
    And I fill "Month" field with "10"
    And I fill "Year" field with "2020"
    And I click "Save and continue" button

    Then I see "Your appeal is late" in title
    And I fill "Why is your appeal late?" field with "My reason for being late"
    And I click "Save and continue" button

    Then I see "Check your answer" in title
    And I check "I believe the information I have given is true" option
    And I click "Send" button
    Then I see "You have sent your appeal details" in title

