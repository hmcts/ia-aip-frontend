Feature: Add a non-legal representative
  In order to achieve my goals
  As a citizen
  I want be able to add a non-legal representative to my appeal

  Scenario: No NLR details
    Given I have logged in as an appellant with email "appeal-submitted-with-no-nlr-details@example.com"
    And I click "Add a non-legal representative" link
    Then I should be taken to the add non legal representative page
    And I should see the add non legal representative page content
    And I check page accessibility

    When I click the "Provide details" button
    Then I should see the stepTwoNoEmailProvided error

    When I click the "Invite to join the appeal" button
    Then I should see the stepThreeNoEmailProvided error

    When I click the "Invite to create an account" button
    Then I should be taken to the invite nlr to create an account page
    And I check page accessibility

    When I click the "Send Invite" button
    Then I should see error "Enter an email address"

    When I fill email-value field with "invalid-email"
    And I click the "Send Invite" button
    Then I should see error "Enter an email address in the correct format, like name@example.com"

    When I fill email-value field with "alejandro@example.net"
    And I click the "Send Invite" button
    Then I should see error "Your non-legal representative's email address cannot be the same as your email address"

    When I fill email-value field with "validNlr@test.com"
    And I click the "Send Invite" button

    Then I should see the invited nlr to create an account confirmation page
    When I click the "Back to add non-legal representative" button
    Then I should be taken to the add non legal representative page

  Scenario: NLR email provided without sponsor
    Given I have logged in as an appellant with email "appeal-submitted-with-nlr-email-without-sponsor@example.com"
    And I click "Add a non-legal representative" link
    Then I should be taken to the add non legal representative page
    And I should see the add non legal representative page content
    And I check page accessibility

    When I click the "Invite to join the appeal" button
    Then I should see the stepThreeNoDetailsProvided error

    When I click the "Provide details" button
    Then I should be taken to the provide non legal rep name page
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
    And I check page accessibility

    Then I should be taken to the provide non legal rep address page
    And I check page accessibility
    And I see "What is your non-legal representative's address?" in title
    And I should see the nlr address text area
    And I click save and continue
    Then I should see error "You need to provide your non-legal representative's address"

    When I enter a valid non legal rep address in the text area
    And I click save and continue

    Then I should be taken to the provide non legal rep phone number page
    And I see "What is your non-legal representative's phone number?" in title
    And I click save and continue
    Then I should see error "Enter a phone number"
    And I check page accessibility
    When I enter an invalid non legal rep phone number
    And I click save and continue
    Then I should see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    When I enter a valid landline non legal rep phone number
    And I click save and continue
    Then I should see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    When I enter the non legal rep phone number same as appellant
    And I click save and continue
    And I should see error "Your non-legal representative's phone number cannot be the same as your phone number"
    And I should not see error "Enter a mobile phone number, like 07700 900 982 or +61 2 9999 9999"
    When I enter a valid non legal rep phone number
    And I click save and continue

    Then I should be taken to the provide nlr details CYA page
    And I check page accessibility

    When I click the "Send" button
    Then I should be taken to the provide nlr details confirmation page

    When I click the "Back to add non-legal representative" button
    Then I should be taken to the add non legal representative page

  Scenario: NLR email provided with sponsor
    Given I have logged in as an appellant with email "appeal-submitted-with-nlr-email-with-sponsor@example.com"
    And I click "Add a non-legal representative" link
    Then I should be taken to the add non legal representative page
    And I should see the add non legal representative page content

    When I click the "Provide details" button
    Then I should be taken to the provide non legal rep is same person page
    And I check page accessibility
    And I see "Are your sponsor and non-legal representative the same person?" in title
    When I click save and continue
    Then I should see error "Select yes if your sponsor and non-legal representative are the same person"

    When I select "No" for same person and save and continue
    Then I should be taken to the provide non legal rep name page

    And I see "What is your non-legal representative's name?" in title
    When I enter a full non legal rep name
    And I click save and continue

    Then I should be taken to the provide non legal rep address page
    And I should see the nlr address text area

    When I click the back button
    Then I should be taken to the provide non legal rep name page
    When I click the back button
    Then I should be taken to the provide non legal rep is same person page
    When I select "Yes" for same person and save and continue

    Then I should be taken to the provide non legal rep name page
    And I click save and continue
    Then I should be taken to the provide non legal rep address page
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

    Then I should be taken to the provide non legal rep phone number page
    And I see "What is your non-legal representative's phone number?" in title
    When I enter a valid non legal rep phone number
    And I click save and continue

    Then I should be taken to the provide nlr details CYA page
    And I check page accessibility

    When I click the "Send" button
    Then I should be taken to the provide nlr details confirmation page

    When I click the "Back to add non-legal representative" button
    Then I should be taken to the add non legal representative page

  Scenario: NLR details provided NLR not signed up
    Given I have logged in as an appellant with email "appeal-submitted-with-nlr-details-fail@example.com"
    And I click "Add a non-legal representative" link
    Then I should be taken to the add non legal representative page
    And I should see the add non legal representative page content
    And I check page accessibility

    When I click the "Invite to join the appeal" button
    Then I should see the stepThreeUserNotExisting error

  Scenario: NLR details provided NLR signed up
    Given I have logged in as an appellant with email "appeal-submitted-with-nlr-details@example.com"
    And I click "Add a non-legal representative" link
    Then I should be taken to the add non legal representative page
    And I should see the add non legal representative page content
    And I check page accessibility

    When I click the "Invite to join the appeal" button
    Then I should be taken to the invite nlr to join appeal confirmation page

    When I click on the See your appeal progress link
    Then I should see the appeal overview page
