Feature: Out of Time appeal @outOfTimeAppeal
  In order to send my appeal out of time
  As a citizen
  I need to explain why my appeal is late

  Scenario: Explain the reason why my appeal is late
    Given I have logged in as an appellant in state "appealStarted"
    Then I click continue
    And I check page accessibility

    Then I see "Tell us about your appeal" in title
    And I click on the type-of-appeal link
    And I check page accessibility

    Then I should be taken to the currently living in the United Kingdom page
    When I select Yes and click continue
    And I check page accessibility
    Then I should be taken to the appeal page
    And  I select appeal type Protection
    And I click "Save and continue" button
    And I check page accessibility

    Then I should see the task-list page
    And I click "Your Home Office and personal details" link
    And I check page accessibility
  # When I click on Home office details
    And I check page accessibility
    And I enter "1234-1234-1234-1234" as the Office ref number and click Save and continue
    And I check page accessibility
    And Enter "Random" "User" as my Given and Family Name and click Save and continue
    And I check page accessibility
    And I enter "11" "11" "1999" as my DOB and click Save and continue
    And I check page accessibility
    And I pick "Angola" from the Nationalities drop down and click continue
    And I check page accessibility
    And I enter an out of time letter sent date and click Save and continue
    And I check page accessibility

    Then I see "Upload your Home Office decision letter" in title

    When I click "Upload file" button
    And I check page accessibility
    Then I should see error summary

    When I click "Save and continue" button
    And I check page accessibility
    Then I should see error summary

    Given I choose a file that is "INVALID_TOO_BIG" and click the "Upload file" button
    And I check page accessibility
    Then I should see error summary

    And I choose a file that is "VALID" and click the "Upload file" button
    And I check page accessibility
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see the deportation order page

    When I choose Yes to deportation order
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see the task-list page

    And I click the contact details link
    And I check page accessibility
    And I check the "Mobile phone" option
    And I enter text message number "07899999999"
    And I click "Save and continue" button
    And I check page accessibility
    And I type "W1W 7RT" as my postcode and click Find address
    And I check page accessibility
    And I choose the first address from the dropdown list and click continue
    And I check page accessibility
    And I click "Save and continue" button
    And I check page accessibility
#  And I click on the decision-type link
    And I check page accessibility
#  And I select I want the appeal to be decided with a hearing
#  And I click "Save and continue" button
    And I check page accessibility
#  And I select No, I will pay later
#  And I click "Save and continue" button
    And I check page accessibility
#
#  And I click on the check and send your appeal link
    And I check page accessibility
#  Then I should see late appeal page
#
#  When I click "Save and continue" button
    And I check page accessibility
#  Then I should see error summary
#
#  When I enter "A reason for being late" as the reason for being late
#  And I choose a file that is "INVALID_TOO_BIG" and click the "Save and continue" button
    And I check page accessibility
#  Then I should see error summary
#
#  When I choose a file that is "INVALID_FORMAT" and click the "Save and continue" button
    And I check page accessibility
#  Then I should see error summary
#
#  When I choose a file that is "VALID" and click the "Save and continue" button
    And I check page accessibility
#  Then I should be taken to the check-and-send page
