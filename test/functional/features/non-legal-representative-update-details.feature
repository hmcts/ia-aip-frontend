Feature: Add a non-legal representative
  In order to achieve my goals
  As a citizen
  I want be able to update my details

  Scenario: Update nlr details without sponsor on case
    Given I have logged in as an appellant with email "nlr-login-with-repped-case@example.com"
    Then I should see the Update my details link in the appeal overview page
    And I click "Update my details" link

    Then I should be taken to the update non legal rep name page
    And I see "What is your name?" in title
    And I should see "John" in the "Given names" input
    And I should see "Doe" in the "Family name" input
    When I enter "" in the "Given names" input
    And I enter "" in the "Family name" input
    And I click save and continue
    Then I should see error "You need to provide your updated given name or names"
    And I should see error "You need to provide your updated family name or names"
    And I see "What is your name?" in title
    And I check page accessibility
    When I enter a non legal rep given name
    And I click save and continue
    Then I should not see error "You need to provide your updated given name or names"
    And I should see error "You need to provide your updated family name or names"
    When I enter a non legal rep family name
    And I click save and continue
    Then I should see error "You need to provide your updated given name or names"
    And I should not see error "You need to provide your updated family name or names"
    When I enter a full non legal rep name
    And I click save and continue
    And I check page accessibility

    Then I should be taken to the update non legal rep address page
    And I check page accessibility
    And I see "What is your address?" in title
    And I should see the nlr address text area
    When I enter "" in the "Enter your address" textarea
    And I click save and continue
    Then I should see error "You need to provide your updated address"
    And I see "What is your address?" in title

    When I enter a valid non legal rep address in the text area
    And I click save and continue

    Then I should be taken to the update non legal rep contact details page
    And I check page accessibility
    And I see "What are your contact details?" in title
    When I enter "" in the "Email address" input
    And I enter "" in the "Phone number" input
    And I click save and continue
    Then I should see error "Enter a phone number"
    And I should see error "Enter an email address"
    And I see "What are your contact details?" in title
    And I check page accessibility
    When I enter an invalid non legal rep email
    And I enter an invalid non legal rep phone number
    And I click save and continue
    Then I should see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    And I should see error "Enter an email address in the correct format, like name@example.com"
    When I enter a valid non legal rep email
    And I enter a valid landline non legal rep phone number
    And I click save and continue
    Then I should see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    And I should not see error "Enter an email address in the correct format, like name@example.com"
    When I enter the non legal rep email same as appellant
    And I enter the non legal rep phone number same as appellant
    And I click save and continue
    Then I should see error "Your email address cannot be the same as the appellant's email address"
    And I should see error "our phone number cannot be the same as the appellant's phone number"
    And I should not see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    And I should not see error "Enter an email address in the correct format, like name@example.com"
    When I enter a valid non legal rep email
    And I enter a valid non legal rep phone number
    And I click save and continue

    Then I should be taken to the update nlr details CYA page
    And I check page accessibility

    When I click the "Send" button
    Then I should be taken to the update nlr details confirmation page

    When I click the "Return to appeal" button
    Then I should see the appeal overview page

  Scenario: Update nlr details with sponsor on case not same person
    Given I have logged in as an appellant with email "nlr-login-with-repped-case-and-sponsor@example.com"
    Then I should see the Update my details link in the appeal overview page
    And I click "Update my details" link

    Then I should be taken to the update non legal rep is same person page
    And I see "Are you also acting as the sponsor on this appeal?" in title
    And I check page accessibility
    When I click save and continue
    Then I should see error "Select yes if you are also acting as the sponsor on this appeal"
    And I see "Are you also acting as the sponsor on this appeal?" in title
    And I check page accessibility
    When I select "No" for same person and save and continue

    Then I should be taken to the update non legal rep name page
    And I see "What is your name?" in title
    And I should see "John" in the "Given names" input
    And I should see "Doe" in the "Family name" input
    And I click save and continue

    Then I should be taken to the update non legal rep address page
    And I check page accessibility
    And I see "What is your address?" in title
    And I should see the nlr address text area
    And I click save and continue

    Then I should be taken to the update non legal rep contact details page
    And I see "What are your contact details?" in title
    And I click save and continue

    Then I should be taken to the update nlr details CYA page

    When I click the "Send" button
    Then I should be taken to the update nlr details confirmation page

    When I click the "Return to appeal" button
    Then I should see the appeal overview page

  Scenario: Update nlr details with sponsor on case same person
    Given I have logged in as an appellant with email "nlr-login-with-repped-case-and-sponsor@example.com"
    Then I should see the Update my details link in the appeal overview page
    And I click "Update my details" link

    Then I should be taken to the update non legal rep is same person page
    And I see "Are you also acting as the sponsor on this appeal?" in title
    When I select "Yes" for same person and save and continue

    Then I should be taken to the update non legal rep name page
    And I see "What is your name?" in title
    And I should see "John" in the "Given names" input
    And I should see "Doe" in the "Family name" input
    And I click save and continue

    Then I should be taken to the update non legal rep address page
    And I check page accessibility
    And I see "What is your address?" in title
    And I should see the nlr address UK address
    And I click save and continue
    Then I should see error "You need to provide your updated building number and street name"
    And I should see error "You need to provide your updated Town or City"
    And I should see error "You need to provide your updated Postcode"
    And I check page accessibility

    When I enter a non legal rep address without postcode
    And I click save and continue
    Then I should see error "You need to provide your updated Postcode"
    And I should not see error "You need to provide your updated building number and street name"
    And I should not see error "You need to provide your updated Town or City"

    When I enter a non legal rep address with invalid postcode
    And I click save and continue
    Then I should see error "Enter a valid postcode"
    And I should not see error "You need to provide your updated building number and street name"
    And I should not see error "You need to provide your updated Town or City"
    And I should not see error "You need to provide your updated Postcode"

    When I enter a valid non legal rep address
    And I click save and continue

    Then I should be taken to the update non legal rep contact details page
    And I see "What are your contact details?" in title
    And I click save and continue

    Then I should be taken to the update nlr details CYA page

    When I click the "Send" button
    Then I should be taken to the update nlr details confirmation page

    When I click the "Return to appeal" button
    Then I should see the appeal overview page
