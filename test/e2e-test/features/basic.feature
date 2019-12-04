Feature: Business rules
  In order to achieve my goals
  As a person
  I want be able to sign in

  Scenario: Sign into form
    Given I have a defined step
    When I click start now
    Then I should see the sign in page
    When I enter creds and click sign in
    Then I should see the task-list page
    When I click on Home office details
    Then I should be taken to the home office ref number page
    When I enter "A1234567" and click Save and Continue
    Then I should see letter sent page
    When I enter a date before expiry
    Then I expect to be redirect back to the task-list
    When I click Your personal details
    Then I should be taken to the enter your name page
    When Enter "Random" "User" into the fields
    Then click save and continue
    Then I should be taken to the DOB page
    When I enter "11" "11" "1999" into each input and click continue
    Then I should be taken to nationality page
    When I pick "Angola" from the drop down and click continue
    Then I should be taken to the enter your postcode page
    When I type "W1W 7RT" and click continue
    Then I should be taken to the what is your address page
    When I choose the first item from the dropdown list and click continue
    Then I should be taken to the confirm address page
    When I click continue
    Then I should be taken to the task-list
    Given I click the contact details link
    Then I should be taken to the contact-details page
    When I check the Text message box and type "07899999999" and click save and continue
    Then I should be taken to the task-list page
    When I click on the type-of-appeal link
    Then I should be taken to the appeal page
    When I click on the first checkbox and click save and continue
    Then I should be taken to the task-list
    When I click on the check and send link
    Then I should be taken to the check-and-send page
    When I check the checkbox and click send
    Then I should be taken to the confirmation page

