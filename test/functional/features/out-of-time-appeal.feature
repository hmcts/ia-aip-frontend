Feature: Out of Time appeal @outOfTimeAppeal
  In order to send my appeal out of time
  As a citizen
  I need to explain why my appeal is late

Scenario: Explain the reason why my appeal is late
  Given I have logged in as an appellant in state "appealStarted"
  Then I click continue

  Then I see "Tell us about your appeal" in title
  And I click on the type-of-appeal link

  Then I should be taken to the currently living in the United Kingdom page
  When I select Yes and click continue
  Then I should be taken to the appeal page
  And  I select appeal type Protection
  And I click "Save and continue" button

  Then I should see the task-list page
  And I click "Your Home Office details" link
  # When I click on Home office details
  And I enter "1234-1234-1234-1234" as the Office ref number and click Save and continue
  And I enter an out of time letter sent date and click Save and continue

  Then I see "Upload your Home Office decision letter" in title

  When I click "Upload file" button
  Then I should see error summary

  When I click "Save and continue" button
  Then I should see error summary

  Given I choose a file that is "INVALID_TOO_BIG" and click the "Upload file" button
  Then I should see error summary

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
  And I check the "Mobile phone" option
  And I enter text message number "07899999999"
  And I click "Save and continue" button
#  And I click on the decision-type link
#  And I select I want the appeal to be decided with a hearing
#  And I click "Save and continue" button
#  And I select No, I will pay later
#  And I click "Save and continue" button
#
#  And I click on the check and send your appeal link
#  Then I should see late appeal page
#
#  When I click "Save and continue" button
#  Then I should see error summary
#
#  When I enter "A reason for being late" as the reason for being late
#  And I choose a file that is "INVALID_TOO_BIG" and click the "Save and continue" button
#  Then I should see error summary
#
#  When I choose a file that is "INVALID_FORMAT" and click the "Save and continue" button
#  Then I should see error summary
#
#  When I choose a file that is "VALID" and click the "Save and continue" button
#  Then I should be taken to the check-and-send page

Scenario: Delete an evidence changes on reason should persist
#  Given I have an out of time appeal with reason for being late an evidence
#  And I have logged in
#  And I click "Continue" button
#  Then I see "/about-appeal" in current url
#
#  And I click "Check and send your appeal" button
#  Then I see "/late-appeal" in current url

