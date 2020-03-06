Feature: Business rules
  In order to achieve my goals
  As a person
  I want be able to sign in

  Scenario: Sign into form
    Given I am on home page
    When I click start now
    Then I should see the "Are you at least 18 years old" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently living in England or Wales" eligibility page
    When I select Yes and click continue
    Then I should see the "Are you currently in detention" eligibility page
    When I select No and click continue
    Then I should see the "Are you appealing an Asylum and/or Humanitarian Protection decision" eligibility page
    When I select Yes and click continue
    Then I should see the "Is anyone else in your immediate family appealing their own Home Office decision" eligibility page
    When I select No and click continue
    Then I should see the eligible page
    When I click continue
    Then I should see the sign in page
    When I enter creds and click sign in
    And I click continue
    Then I should see the task-list page
    When I click on Home office details
    Then I should be taken to the home office ref number page
    Then I enter a home office reference "A1234567"
    And I click "Save and continue" button
    Then I should see letter sent page
    When I enter an on time letter sent date
    Then I click "Save and continue" button
    Then I expect to be redirect back to the task-list
    When I click Your personal details
    Then I should be taken to the enter your name page
    When Enter "Random" "User" as my Given and Family Name and click Save and continue
    Then I click "Save and continue" button
    Then I should be taken to the DOB page
    When I enter "11" "11" "1999" as my DOB and click Save and continue
    Then I should be taken to nationality page
    When I pick "Angola" from the Nationalities drop down and click continue
    Then I should be taken to the enter your postcode page
    When I type "W1W 7RT" as my postcode and click Find address
    Then I should be taken to the what is your address page
    When I choose the first address from the dropdown list and click continue
    Then I should be taken to the confirm address page
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    Given I click the contact details link
    Then I should be taken to the contact-details page
    And I check the "Text message" option
    Then I click "Save and continue" button
    And I enter text message number "07899999999"
    Then I click "Save and continue" button
    Then I should be taken to the task-list page

    When I click on the type-of-appeal link
    Then I should be taken to the appeal page
    When I click on Protection as my type of appeal and click Save and continue
    Then I should be taken to the task-list page
    When I click on the check and send your appeal link
    Then I should be taken to the check-and-send page
    # When I check the checkbox and click send
    # Then I should be taken to the confirmation page