Feature: Sponsor details
In order to achieve my goals
As a citizen
I want be able to capture my sponsor details for an out of country appeal

Scenario: Complete appeal application
  Given I am authenticated as a valid appellant
  When I visit the overview page
  And I click continue
  Then I should see the task-list page

  # Appeal type page
  And I see "Tell us about your appeal" in title
  When I click on the type-of-appeal link
  Then I should be taken to the currently living in the United Kingdom page
  When I select No and click continue
  Then I see "What is your appeal type?" in title
  When I select appeal type Protection
  And I click "Save and continue" button
  Then I should be taken to the Date Leave UK page
  When I enter "11" "11" "1999" as my Leave UK date and click Save and continue
  Then I should see the task-list page

  # Your Home Office details page
  And I see "Tell us about your appeal" in title
  When I click on Home office details
  Then I should be taken to the home office ref number page
  When I enter a home office reference "1212-0099-0062-8083"
  And I click "Save and continue" button
  Then I should see letter received page
  When I enter an on time letter received date
  Then I click "Save and continue" button
  When I upload a Home Office decision letter
  And I click "Save and continue" button
  Then I should see the task-list page

  # Your personal details page
  And I see "Tell us about your appeal" in title
  When I click Your personal details
  Then I should be taken to the enter your name page
  When Enter "Random" "User" as my Given and Family Name and click Save and continue
  And I click "Save and continue" button
  Then I should be taken to the DOB page
  When I enter "11" "11" "1999" as my DOB and click Save and continue
  Then I should be taken to nationality page
  When I pick "Ukraine" from the Nationalities drop down and click continue
  Then I am on the out of country address page
  And I see "What is your address?" in title
  When I enter an out of country address of "28 The Street, Ukraine, 23234"
  And I click "Save and continue" button
  Then I should see the task-list page

  # Your contact details page
  And I see "Tell us about your appeal" in title
  When I click the contact details link
  Then I should be taken to the contact-details page
  Then I check the "Email" option
  And I enter email "random@email.com"
  Then I check the "Mobile phone" option
  And I enter text message number "07899999999"
  Then I click "Save and continue" button
  And I should be taken to the has sponsor page
  Then I see "Do you have a sponsor?" in title
  When I select Yes and click continue
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
  When I select Yes and click continue
  Then I should see the task-list page

