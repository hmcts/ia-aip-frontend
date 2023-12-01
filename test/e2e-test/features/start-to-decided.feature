@nightly-test
Feature: Start to decided

Scenario: Create appeal and force case through to decided
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
  And I wait for 5 seconds
  And I go to appeal overview page
  Then I should see the appeal overview page
  When I click continue
  Then I should be taken to the task-list page
  When I click on the check and send your appeal link
  Then I should be taken to the check-and-send page
  When I check the statement of truth
  And I submit appeal for a decision with hearing paid appeal
  Then I am on the appeal details submitted page
  When I click "Pay for this appeal" button
  Then I am on the make payment page
  When I make a successful payment
  Then I am on the appeal details sent with payment page
  And I see "Your appeal details have been sent" in title
  And I see the respond by date is 5 days in the future

  # Case Progression
  When I grab the Appeal Reference
  And I sign in as a Case Officer and Request Home Office data
  And I Request respondent evidence
  And I Request the reasons for appeal
  And I Force the case to case under review
  And I Request respondent review
  And I Force the case to submit hearing requirements
  And I List without requirements
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
