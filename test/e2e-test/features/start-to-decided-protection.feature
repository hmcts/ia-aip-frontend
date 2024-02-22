@e2e-pa
Feature: Start to FTPA submitted
  Scenario: Create appeal and force case through to decided
    Given I am on home page
    When I click Sign in to continue with your appeal
    Then I should see the sign in page
    When I am authenticated as a valid appellant
    Then I should see the appeal overview page
    And I should see the 'do this next section' for 'New - Appeal started'
    When I click continue
    Then I should see the task-list page
    When I go into the Appeal type task
    Then I should be taken to the Is the appellant in the UK page
    When I select Yes
    And I click "Continue" button
    Then I should be taken to the appeal page
    When I select appeal type Protection
    And I click "Save and continue" button
    Then I expect to be redirect back to the task-list
    When I go into the Home office details task
    Then I should be taken to the home office ref number page
    Then I enter a home office reference "1212-0099-0062-8083"
    And I click "Save and continue" button
    Then I should see letter sent page
    When I enter an on time letter sent date
    Then I click "Save and continue" button
    When I upload a Home Office decision letter
    Then I click "Save and continue" button
    Then I expect to be redirect back to the task-list
    When I go into the Personal details task
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
    Then I expect to be redirect back to the task-list
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    Then I check the "Email" option
    And I enter email "random@email.com"
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I expect to be redirect back to the task-list
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    And I wait for 5 seconds
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    When I click continue
    Then I expect to be redirect back to the task-list
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details PA pay now submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    And I wait for 4 seconds
    Then I am on the appeal details sent with payment page
    And I wait for 5 seconds
    And I wait for 6 seconds
    And I see "Your appeal details have been sent" in title
    And I wait for 6.1 seconds
    And I see the respond by date is 5 days in the future

    # # Case Progression
    When I grab the Appeal Reference
    And I wait for 6.2 seconds
    And I sign in as a Case Officer and Request Home Office data
    And I Request respondent evidence
    And I wait for 1 seconds
    And I Request the reasons for appeal
    And I wait for 1.1 seconds
    And I Force the case to case under review
    And I wait for 1.2 seconds
    And I Request respondent review
    And I wait for 1.3 seconds
    And I Force the case to submit hearing requirements
    And I wait for 1.4 seconds
    And I List without requirements
    And I wait for 1.5 seconds
    And I sign in as an Admin Officer and List the case
    And I wait for 5 seconds
    And I sign in as a Case Officer and Create the case summary
    And I wait for 5 seconds
    And I Generate the hearing bundle
    And I wait for 3 seconds
    And I Start decision and reasons
    And I wait for 3 seconds
    And I sign in as a Judge and Prepare Decision and Reasons
    And I wait for 3 seconds
    And I Complete the Decision and Reasons

    # #   # Appellant
    Given I am on home page
    And I wait for 1.6 seconds
    And I sign out
    And I wait for 1.7 seconds
    When I click Sign in to continue with your appeal
    And I wait for 1.8 seconds
    Then I should see the sign in page
    And I wait for 1.9 seconds
    And I sign in as the appellant
    And I wait for 1.8 seconds
    When I visit the overview page
    And I wait for 1.7 seconds
    Then I see "A judge has allowed your appeal." description in overview banner
    And I wait for 1.6 seconds
    And I click "Read the Decision and Reasons document" link
    And I wait for 1.5 seconds
    Then I see "Decision and Reasons" in title
    And I click "Back" button
    And I wait for 5 seconds



    # Apply for FTPA
    When I click the Apply for permission to appeal to the Upper Tribunal link
    Then I should see the ftpa reason page
    Then I fill in the textarea with "Reason why it is wrong"
    Then I click continue
    Then I should see "Do you want to provide supporting evidence" on the page
    Then I see "/ftpa-evidence-question" in current url
    When I select Yes and click continue
    Then I see "/ftpa-evidence" in current url
    Then I should see "Provide supporting evidence" on the page
    Given I choose a file that is "VALID" and click the "Upload file" button
    When I click "Continue" button
    Then I see "/ftpa-check-answer" in current url
    Then I should see "Check your answer" on the page
    When I click "Confirm and send" button
    Then I see "/ftpa-confirmation" in current url
    When I click "See your appeal progress" link
    Then I am on the overview page
    Then I see "A judge will decide your application for permission to appeal to the Upper Tribunal." on the page
