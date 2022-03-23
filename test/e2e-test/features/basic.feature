@crossbrowser
@e2e
Feature: Business rules
In order to achieve my goals
As a person
I want be able to sign in

Scenario: Complete appeal application
  # Given I am on home page
  # When I click start now
  # TODO: Remove "Are you currently living in the United Kingdom" step when "Feature flag for Out of Country feature" flag is switched on
  # Then I should see the "Are you currently living in the United Kingdom" eligibility page
  # When I select Yes and click continue
  # Then I should see the "Are you currently in detention" eligibility page
  # When I select No and click continue
  # Then I should see the "Are you appealing an EU Settlement Scheme decision?" eligibility page
  # When I select No and click continue
  # Then I should see the "Are you appealing a Revocation of Protection Status or Deprivation of Citizenship decision" eligibility page
  # When I select Yes and click continue
  # Then I should see the eligible page
  # When I click continue
  # Then I should see the Create an account page
  # When I click Sign in to your account
  # Then I should see the sign in page
#  When I am authenticated as a valid appellant
#  Then I should see the appeal overview page
#  And I should see the 'do this next section' for 'New - Appeal started'
#  When I click continue
#  Then I should see the task-list page
#  When I click on the type-of-appeal link
#  Then I should be taken to the appeal page
#  When I select appeal type Protection
#  And I click "Save and continue" button
#  Then I should see the task-list page
#  When I click on Home office details
#  Then I should be taken to the home office ref number page
#  Then I enter a home office reference "1212-0099-0062-8083"
#  And I click "Save and continue" button
#  Then I should see letter sent page
#  When I enter an on time letter sent date
#  Then I click "Save and continue" button
#  When I upload a Home Office decision letter
#  Then I click "Save and continue" button
#  Then I expect to be redirect back to the task-list
#  When I click Your personal details
#  Then I should be taken to the enter your name page
#  When Enter "Random" "User" as my Given and Family Name and click Save and continue
#  Then I click "Save and continue" button
#  Then I should be taken to the DOB page
#  When I enter "11" "11" "1999" as my DOB and click Save and continue
#  Then I should be taken to nationality page
#  When I pick "Angolan" from the Nationalities drop down and click continue
#  Then I should be taken to the enter your postcode page
#  When I type "W1W 7RT" as my postcode and click Find address
#  Then I should be taken to the what is your address page
#  When I choose the first address from the dropdown list and click continue
#  Then I should be taken to the confirm address page
#  And I click "Save and continue" button
#  Then I should be taken to the task-list page
#  Given I click the contact details link
#  Then I should be taken to the contact-details page
#  And I check the "Text message" option
#  Then I click "Save and continue" button
#  And I enter text message number "07899999999"
#  Then I click "Save and continue" button
#  Then I should be taken to the task-list page

#  When I click on the type-of-appeal link
#  Then I should be taken to the appeal page
#
#  When I select appeal type Protection
#  And I click "Save and continue" button
#  Then I should see the task-list page
#
#  When I click on the check and send your appeal link
#  Then I should be taken to the check-and-send page
#
#  When I check the statement of truth
#  And I click send
#  Then I am on the appeal details sent page
#  And I see "Your appeal details have been sent" in title
#  And I see the respond by date is 5 days in the future
#
#  # Case Progression
#  Then I sign in as a Case Officer and request HO data to match appellant details
#  Then I sign in as a Case Officer and request HO Bundle
#  Then I sign in as a Home Office Generic and upload the HO Bundle
#  Then I sign in as a Case Officer and request the reasons for appeal
#
#   # Appellant
#   Given I sign in as the Appellant
#   When I visit the overview page
#   Then I should see the 'do this next section' for 'Awaiting reasons for appeal'
##   #    Reenable when ask for more time flag is on by default
##   #    Then I should see the 'ask for more time' link
#
#    When I click 'ask for more time'
#    Then I should see the ask-for-more-time page
#    When I enter a time extensions reason
#    And I click continue
#    Then I should see do you want to upload evidence page
#    When I select No and click continue
#    Then I should see the ask for more time check you answers page
#    When I click send
#    Then I am on the overview page
#
#   Then I click continue
#   Then I should see the reasons for appeal decision page
#   When I visit reasons for appeal
#
#   Then I enter "A description of why I think the appeal is wrong" into the reason for appeal text box and click Save and Continue
#   Then I should see the "supporting evidence question" page
#
#   When I select No and click continue
#   Then I should see the reasons for appeal CYA page
#
#   When I click "Send" button
#   Then I should see the reasons for appeal confirmation page
#   And I see the respond by date is 2 weeks in the future
#
##   # Case Progression
#   Then I sign in as a Case Officer and send directions with Clarifying Questions

#   # Appellant
#   Given I sign in as the Appellant
#   When I visit the overview page
#   Then I see "You need to answer some questions about your appeal." description in overview banner
#   Then I click "Continue" button
#   Then I see "Questions about your appeal" in title
#   Then I see "Answer question 1" item in list
#   Then I see "Answer question 2" item in list

#   When I click "Answer question 1" link
#   Then I see "Question 1" in title
#   Then I fill textarea with "my answer for question 1"
#   Then I click "Save and continue" button
#   Then I see "Do you want to provide supporting evidence?" in title
#   Then I click "No" button
#   Then I click "Continue" button
#   Then I see "Questions about your appeal" in title
#   And I see clarifying question "1" saved

#   When I click "Answer question 2" link
#   Then I see "Question 2" in title
#   Then I fill textarea with "my answer for question 2"
#   Then I click "Save and continue" button
#   Then I see "Do you want to provide supporting evidence?" in title
#   Then I click "No" button
#   Then I click "Continue" button
#   Then I see "Questions about your appeal" in title
#   Then I see clarifying question "2" saved
#   And I see "Do you want to tell us anything else about your case?" link

#   When I click "Do you want to tell us anything else about your case?" link
#   Then I see "Do you want to tell us anything else about your case?" in title
#   Then I click "Yes" button
#   Then I click "Continue" button
#   Then I see "Do you want to tell us anything else about your case?" in title
#   Then I fill textarea with "my answer for anything else question"
#   Then I click "Save and continue" button
#   Then I see "Do you want to provide supporting evidence?" in title
#   Then I click "No" button
#   Then I click "Continue" button
#   Then I see "Questions about your appeal" in title
#   Then I see anything else clarifying question saved
#   And I see "Check and send your answers" link

#   When I click "Check and send your answers" link
#   Then I see "You have answered the Tribunal's questions" in title
#   Then I click "Send" button
#   And I see "You have answered the Tribunal's questions" in title
#   Then I click "See your appeal progress" button
#   And I see "A Tribunal Caseworker is looking at your answers and will contact you to tell you what to do next" description in overview banner
