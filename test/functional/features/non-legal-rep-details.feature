Feature: Non-legal representative details
  In order to achieve my goals
  As a citizen
  I want be able to capture my Non-legal representative's details with the correct validation

  Scenario: Sponsor Yes NLR Yes Same Person Yes
    Given I have logged in as an appellant with email "appealWithPersonalAndContactDetailsUpToHasSponsorOrNlr@example.com"
    Then I click continue
    And I go to the has sponsor or nlr page
    Then I should be taken to the has sponsor or nlr page
    And I check page accessibility
    When I select "Yes" for sponsor and "Yes" for non-legal representative and click continue
    And I check page accessibility

    Then I should be taken to the is sponsor and nlr the same person page
    And I check page accessibility
    When I select "Yes" for same person and save and continue

    Then I should be taken to the non legal rep name page
    And I check page accessibility
    And I see "What is your non-legal representative's name?" in title
    And I click save and continue
    Then I should see error "You need to provide your non-legal representative's given name or names"
    And I should see error "You need to provide your non-legal representative's family name or names"
    And I check page accessibility
    When I enter a non legal rep given name
    And I click save and continue
    Then I should not see error "You need to provide your non-legal representative's given name or names"
    And I should see error "You need to provide your non-legal representative's family name or names"
    When I enter a non legal rep family name
    And I click save and continue
    Then I should see error "You need to provide your non-legal representative's given name or names"
    And I should not see error "You need to provide your non-legal representative's family name or names"
    When I enter a full non legal rep name
    And I click save and continue

    Then I should be taken to the non legal rep address page
    And I check page accessibility
    And I see "What is your non-legal representative's address?" in title
    And I should see the nlr address UK address
    And I click save and continue
    Then I should see error "You need to provide your non-legal representative's building number and street name"
    And I should see error "You need to provide your non-legal representative's Town or City"
    And I should see error "You need to provide your non-legal representative's Postcode"
    And I check page accessibility
    When I enter a non legal rep address without postcode
    And I click save and continue
    Then I should see error "You need to provide your non-legal representative's Postcode"
    And I should not see error "You need to provide your non-legal representative's building number and street name"
    And I should not see error "You need to provide your non-legal representative's Town or City"

    When I enter a non legal rep address with invalid postcode
    And I click save and continue
    Then I should see error "Enter a valid postcode"
    And I should not see error "You need to provide your non-legal representative's building number and street name"
    And I should not see error "You need to provide your non-legal representative's Town or City"
    And I should not see error "You need to provide your non-legal representative's Postcode"
    When I enter a valid non legal rep address
    And I click save and continue

    Then I should be taken to the non legal rep contact details page
    And I check page accessibility
    And I see "What are your non-legal representative's contact details?" in title
    And I click save and continue
    Then I should see error "Enter a phone number"
    And I should see error "Enter an email address"
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
    Then I should see error "Your non-legal representative's email address cannot be the same as your email address"
    And I should see error "Your non-legal representative's phone number cannot be the same as your phone number"
    And I should not see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    And I should not see error "Enter an email address in the correct format, like name@example.com"
    When I enter a valid non legal rep email
    And I enter a valid non legal rep phone number
    And I click save and continue

    Then I should see the task-list page
    And I should be able to click "Decision type"
    And I check page accessibility

  Scenario: Sponsor Yes NLR Yes Same Person No
    Given I have logged in as an appellant with email "appealWithPersonalAndContactDetailsUpToHasSponsorOrNlr@example.com"
    Then I click continue
    And I go to the has sponsor or nlr page
    Then I should be taken to the has sponsor or nlr page

    Then I see "Do you have a sponsor or a non-legal representative?" in title
    When I select "Yes" for sponsor and "Yes" for non-legal representative and click continue
    Then I should be taken to the is sponsor and nlr the same person page
    When I select "No" for same person and save and continue
    Then I should be taken to the has sponsor name page
    And I see "What is your sponsor's name?" in title
    When I enter "Frank" "Smith" as my sponsor's Given and Family Name and click Save and continue
    And I click "Save and continue" button
    Then I should be taken to the has sponsor address page
    And I see "What is your sponsor's address?" in title
    When I enter sponsor building and street "1 The Street", Town or city "Nowhere", Postcode "CM15 8BN"
    And I click "Save and continue" button
    Then I should be taken to the sponsor contact details page
    Then I check the "Email" option
    And I enter sponsor email "frank@smith.com"
    Then I check the "Text message" option
    And I enter sponsor mobile number "07888888888"
    Then I click "Save and continue" button
    And I should be taken to the has sponsor authorisation page
    Then I see "Do you agree to let your sponsor have access to information about your appeal?" in title
    When I choose Yes and click Save and continue

    Then I should be taken to the non legal rep name page
    And I see "What is your non-legal representative's name?" in title
    When I enter a full non legal rep name
    And I click save and continue

    Then I should be taken to the non legal rep address page
    And I check page accessibility
    And I see "What is your non-legal representative's address?" in title
    And I should see the nlr address text area
    And I click save and continue
    Then I should see error "You need to provide your non-legal representative's address"

    When I enter a valid non legal rep address in the text area
    And I click save and continue

    Then I should be taken to the non legal rep contact details page
    And I see "What are your non-legal representative's contact details?" in title
    When I enter a valid non legal rep email
    And I enter a valid non legal rep phone number
    And I click save and continue

    Then I should see the task-list page
    And I should be able to click "Decision type"

  Scenario: Sponsor Yes NLR No
    Given I have logged in as an appellant with email "appealWithPersonalAndContactDetailsUpToHasSponsorOrNlr@example.com"
    Then I click continue
    And I go to the has sponsor or nlr page
    Then I should be taken to the has sponsor or nlr page

    Then I see "Do you have a sponsor or a non-legal representative?" in title
    When I select "Yes" for sponsor and "No" for non-legal representative and click continue
    Then I should be taken to the has sponsor name page
    And I see "What is your sponsor's name?" in title
    When I enter "Frank" "Smith" as my sponsor's Given and Family Name and click Save and continue
    And I click "Save and continue" button
    Then I should be taken to the has sponsor address page
    And I see "What is your sponsor's address?" in title
    When I enter sponsor building and street "1 The Street", Town or city "Nowhere", Postcode "CM15 8BN"
    And I click "Save and continue" button
    Then I should be taken to the sponsor contact details page
    Then I check the "Email" option
    And I enter sponsor email "frank@smith.com"
    Then I check the "Text message" option
    And I enter sponsor mobile number "07888888888"
    Then I click "Save and continue" button
    And I should be taken to the has sponsor authorisation page
    Then I see "Do you agree to let your sponsor have access to information about your appeal?" in title
    When I choose Yes and click Save and continue

    Then I should see the task-list page
    And I should be able to click "Decision type"

  Scenario: Sponsor No NLR Yes
    Given I have logged in as an appellant with email "appealWithPersonalAndContactDetailsUpToHasSponsorOrNlr@example.com"
    Then I click continue
    And I go to the has sponsor or nlr page
    Then I should be taken to the has sponsor or nlr page

    Then I see "Do you have a sponsor or a non-legal representative?" in title
    When I select "No" for sponsor and "Yes" for non-legal representative and click continue

    Then I should be taken to the non legal rep name page
    And I see "What is your non-legal representative's name?" in title
    When I enter a full non legal rep name
    And I click save and continue

    Then I should be taken to the non legal rep address page
    And I check page accessibility
    And I see "What is your non-legal representative's address?" in title
    And I should see the nlr address text area

    When I enter a valid non legal rep address in the text area
    And I click save and continue

    Then I should be taken to the non legal rep contact details page
    And I see "What are your non-legal representative's contact details?" in title
    When I enter a valid non legal rep email
    And I enter a valid non legal rep phone number
    And I click save and continue

    Then I should see the task-list page
    And I should be able to click "Decision type"

