@nightly-test
Feature: Business rules
In order to achieve my goals
As a person
I want be able to sign in

Scenario: Complete appeal application
  Given I am on home page
  When I click Sign in to continue with your appeal
  Then I should see the sign in page
  When I am authenticated as a valid appellant
  Then I should see the appeal overview page
  And I should see the 'do this next section' for 'New - Appeal started'
  When I click continue
  Then I should see the task-list page
  When I click on the type-of-appeal link
  Then I should be taken to the Is the appellant in the UK page
  When I select Yes
  And I click "Continue" button
  Then I should be taken to the appeal page
  When I select appeal type Protection
  And I click "Save and continue" button
  Then I should see the task-list page
  When I click on Home office details
  Then I should be taken to the home office ref number page
  Then I enter a home office reference "1212-0099-0062-8083"
  And I click "Save and continue" button
  Then I should see letter sent page
  When I enter an on time letter sent date
  Then I click "Save and continue" button
  When I upload a Home Office decision letter
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
  And I enter text message number "07899999999"
  Then I click "Save and continue" button
  Then I should be taken to the task-list page
  When I click on the decision-type link
  Then I should be taken to the decision type page
  When I select a decision with a hearing for a PA pay now appeal
  And I click "Save and continue" button
  Then I should be taken to the pcq-questions page
  When I click "I don't want to answer these questions" button
  Given I am on home page
  When I click Sign in to continue with your appeal
  Then I should see the appeal overview page
  When I click continue
  Then I should be taken to the task-list page
  When I click on the check and send your appeal link
  Then I should be taken to the check-and-send page
  When I check the statement of truth
  And I submit appeal for a decision with hearing paid appeal

  Then I am on the appeal details sent page
  And I see "Your appeal details have been sent" in title
  And I see the respond by date is 5 days in the future

  # Case Progression
  And I grab the Appeal Reference
  Then I sign in as a Case Officer and Request Home Office data
  Then I Request respondent evidence
  Then I Request the reasons for appeal

#   # Appellant
  Given I am on home page
  And I sign out
  When I click Sign in to continue with your appeal
  Then I should see the sign in page
  And I sign in as the appellant
  When I visit the overview page
  Then I should see the 'do this next section' for 'Awaiting reasons for appeal'
  Then I should see the 'ask for more time' link
  When I click 'ask for more time'
  Then I should see the ask-for-more-time page
  When I enter a time extensions reason
  And I click continue
  Then I should see do you want to upload evidence page
  When I select No and click continue
  Then I should see the ask for more time check you answers page
  When I click send
  Then I am on the overview page

  Then I click continue
  Then I should see the reasons for appeal decision page
  When I visit reasons for appeal

  Then I enter "A description of why I think the appeal is wrong" into the reason for appeal text box and click Save and Continue
  Then I should see the "supporting evidence question" page

  When I select No and click continue
  Then I should see the reasons for appeal CYA page

  When I click "Send" button
  Then I should see the reasons for appeal confirmation page
  And I see the respond by date is 2 weeks in the future

##   # Case Progression
  Then I sign in as a Case Officer and Ask Clarifying Questions

#   # Appellant
  Given I am on home page
  And I sign out
  When I click Sign in to continue with your appeal
  Then I should see the sign in page
  And I sign in as the appellant
  When I visit the overview page
  Then I see "You might not get more time. You need to finish answering the Tribunal’s questions by" description in overview banner
  Then I click "Continue" button
  Then I see "Questions about your appeal" in title
  Then I see "Answer question 1" item in list
  Then I see "Do you want to tell us anything else about your case?" item in list

  When I click "Answer question 1" link
  Then I see "Question 1" in title
  Then I fill textarea with "my answer for question 1"
  Then I click "Save and continue" button
  Then I see "Do you want to provide supporting evidence?" in title
  Then I click "No" button
  Then I click "Continue" button
  Then I see "Questions about your appeal" in title
  And I see clarifying question "1" saved

  When I click "Do you want to tell us anything else about your case?" link
  Then I see "Do you want to tell us anything else about your case?" in title
  Then I click "No" button
  Then I click "Continue" button
  Then I see "Questions about your appeal" in title

  When I click "Check and send your answers" link
  Then I see "You have answered the Tribunal's questions" in title
  Then I click "Send" button
  And I see "You have answered the Tribunal's questions" in title
  Then I click "See your appeal progress" button
  And I see "You have told us why you think the Home Office decision is wrong." description in overview banner

  ##   # Case Progression
  Then I sign in as a Case Officer and Request respondent review
  Then I Force the case to submit hearing requirements

#   # Appellant
  Given I am on home page
  And I sign out
  When I click Sign in to continue with your appeal
  Then I should see the sign in page
  And I sign in as the appellant
  When I visit the overview page
  Then I see "It’s important to respond by the deadline but, if you can’t answer fully, you will be able to provide more information about your appeal later." description in overview banner
  Then I click "Continue" button
  Then I see "Tell us what you will need at the hearing" in title
  Then I see "Will any witnesses come to the hearing?" item in list
  Then I see "Will you or any witnesses need an interpreter,step-free access or a hearing loop at the hearing?" item in list
  Then I see "Will you need anything else at the hearing?" item in list
  Then I see "Are there any dates you or any witnesses cannot go to the hearing?" item in list
  Then I see "Check and send your answers" item in list

  When I click "Will any witnesses come to the hearing?" link
  Then I see "Will any witnesses come to the hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Will you or any witnesses take part in the hearing from outside the UK?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Tell us what you will need at the hearing" in title
  And I see hearing requirement section "1" saved

  When I click "Will you or any witnesses need an interpreter,step-free access or a hearing loop at the hearing?" link
  Then I see "Access needs" in title
  Then I click "Continue" button
  Then I see "Will you or any witnesses need an interpreter at the hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Will you or any witnesses need step-free access?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Will you or any witnesses need a hearing loop?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Tell us what you will need at the hearing" in title
  And I see hearing requirement section "2" saved

  When I click "Will you need anything else at the hearing?" link
  Then I see "Other needs" in title
  Then I click "Continue" button
  Then I see "Would you be able to join the hearing by video call?" in title
  Then I click "Yes" button
  Then I click "Save and continue" button
  Then I see "Will you bring any video or audio evidence to the hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Will you need an all-female or all-male hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Will you need a private hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Do you have any physical or mental health conditions that may affect you at the hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Have you had any past experiences that may affect you at the hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Will you need anything else at the hearing?" in title
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Tell us what you will need at the hearing" in title
  And I see hearing requirement section "3" saved

  When I click "Are there any dates you or any witnesses cannot go to the hearing?" link
  Then I see Are there any dates between today's date and 6 weeks time that you or any witnesses cannot go to the hearing?
  Then I click "No" button
  Then I click "Save and continue" button
  Then I see "Tell us what you will need at the hearing" in title
  And I see hearing requirement section "4" saved

  When I click "Check and send your answers" link
  Then I see "Check your answers" in title
  Then I click "Send" button
  And I see "You have told us what you will need at the hearing" in title
  Then I click "See your appeal progress" button
  And I see "A Tribunal Caseworker is looking at your answers and will contact you with the details of your hearing and to tell you what to do next." description in overview banner

  ##   # Case Progression
  Then I sign in as a Case Officer and Review and record the hearing requirements
  And I sign in as an Admin Officer and List the case
  And I sign in as a Case Officer and Create the case summary
  And I Generate the hearing bundle
  And I Start decision and reasons
  And I sign in as a Judge and Prepare Decision and Reasons
  And I Complete the Decision and Reasons

#   # Appellant
  Given I am on home page
  And I sign out
  When I click Sign in to continue with your appeal
  Then I should see the sign in page
  And I sign in as the appellant
  When I visit the overview page
  Then I see "A judge has allowed your appeal." description in overview banner
  And I click "Read the Decision and Reasons document" link
  Then I see "Decision and Reasons" in title
