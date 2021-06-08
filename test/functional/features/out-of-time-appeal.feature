Feature: Out of Time appeal
  In order to send my appeal out of time
  As a citizen
  I need to explain why my appeal is late

Scenario: Explain the reason why my appeal is late
  Given I am authenticated as a valid appellant
  Then I click continue
  And I click "Your Home Office details" link
  # When I click on Home office details
  And I enter "1234-1234-1234-1234" as the Office ref number and click Save and continue
  And I enter an out of time letter sent date and click Save and continue

  Then I see "Upload your Home Office decision letter" in title
  And I choose a file that is "VALID" and click the "Upload file" button
  And I click "Save and continue" button

  And I click "Your personal details" link
  And Enter "Random" "User" as my Given and Family Name and click Save and continue
  And I enter "11" "11" "1999" as my DOB and click Save and continue
  And I pick "Angola" from the Nationalities drop down and click continue
  And I type "W1W 7RT" as my postcode and click Find address
  And I choose the first address from the dropdown list and click continue
  And I click "Save and continue" button
  And I click the contact details link
  And I check the "Text message" option
  And I enter text message number "07899999999"
  And I click "Save and continue" button
  And I click on the type-of-appeal link
  And I click on Protection as my type of appeal and click Save and continue
  And I click on the check and send your appeal link
  Then I should see late appeal page

  When I click "Save and continue" button
  Then I should see error summary

  When I enter "A reason for being late" as the reason for being late
  And I choose a file that is "INVALID_TOO_BIG" and click the "Save and continue" button
  Then I should see error summary

  When I choose a file that is "INVALID_FORMAT" and click the "Save and continue" button
  Then I should see error summary

  When I choose a file that is "VALID" and click the "Save and continue" button
  Then I should be taken to the check-and-send page

Scenario: Delete an evidence changes on reason should persist
  Given I have an out of time appeal with reason for being late an evidence
  And I have logged in
  And I click "Continue" button
  And I should see the "Task list" page
  And I click "Check and send your appeal" button
  And I should see the "Check and send" page
  And I click Reason for late appeal change button
  And I should see the "Out of time appeal" page
  And I enter "reason" as the reason for being late
  And I click "Delete" button
  Then I see "reason" as my reason for being late
  And I dont see Uploaded file list

