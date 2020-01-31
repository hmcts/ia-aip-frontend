Feature: Back button
  In order to send my appeal out of time
  As a citizen
  I need to explain why my appeal is late

Scenario: Explain the reason why my appeal is late
  Given I am authenticated as a valid appellant
  Then I click continue
  When I click on Home office details
  And I enter "A1234567" as the Office ref number and click Save and continue
  And I enter an out of time letter sent date and click Save and continue

  And I click Your personal details
  And Enter "Random" "User" as my Given and Family Name and click Save and continue
  And I enter "11" "11" "1999" as my DOB and click Save and continue
  And I pick "Angola" from the Nationalities drop down and click continue
  And I type "W1W 7RT" as my postcode and click Find address
  And I choose the first address from the dropdown list and click continue
  And I click "Save and continue" button
  And I click the contact details link
  And I check the Text message option and type "07899999999" as my phone number and click Save and continue
  And I click on the type-of-appeal link
  And I click on Protection as my type of appeal and click Save and continue
  And I click on the check and send your appeal link
  Then I should see late appeal page

  When I enter "A reason for being late" as the reason for being late and click Save and continue
  And I click on the check and send your appeal link
  Then I should be taken to the check-and-send page
