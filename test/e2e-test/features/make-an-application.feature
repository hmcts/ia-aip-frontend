@nightly-test
Feature: Make an application
  Scenario: Ask to withdraw
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
    Then I should see the task-list page
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
    Then I should be taken to the task-list page
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    And I click continue
    Then I should be taken to the task-list page
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    Then I am on the appeal details sent with payment page
    And I see "Your appeal details have been sent" in title
    And I click on the See your appeal progress link
    Then I should see the appeal overview page

    When I click the Withdraw my appeal link
    Then I should see the Ask to withdraw the appeal page
    When I complete the Ask to withdraw the appeal page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask to withdraw the appeal request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to change some of your details
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
    Then I should see the task-list page
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
    Then I should be taken to the task-list page
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    And I click continue
    Then I should be taken to the task-list page
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    Then I am on the appeal details sent with payment page
    And I see "Your appeal details have been sent" in title
    And I click on the See your appeal progress link
    Then I should see the appeal overview page

    When I click the Ask to change some of your details link
    Then I should see the Ask to change some of your details page
    When I complete the Ask to change some of your details page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask to change some of your details request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to link or unlink
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
    Then I should see the task-list page
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
    Then I should be taken to the task-list page
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    And I click continue
    Then I should be taken to the task-list page
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    Then I am on the appeal details sent with payment page
    And I see "Your appeal details have been sent" in title
    And I click on the See your appeal progress link
    Then I should see the appeal overview page

    When I click the Ask to link or unlink with another appeal link
    Then I should see the Ask to link or unlink this appeal page
    When I complete the Ask to link or unlink this appeal page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask to link or unlink this appeal request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to get judge to review
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
    Then I should see the task-list page
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
    Then I should be taken to the task-list page
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    And I click continue
    Then I should be taken to the task-list page
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    Then I am on the appeal details sent with payment page
    And I see "Your appeal details have been sent" in title
    And I click on the See your appeal progress link
    Then I should see the appeal overview page

    When I click the Ask for a judge to review a decision by a Tribunal Caseworker link
    Then I should see the Ask for a judge to review a decision page
    When I complete the Ask for a judge to review a decision page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask for a judge to review a decision request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to do something else
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
    Then I should see the task-list page
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
    Then I should be taken to the task-list page
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    And I click continue
    Then I should be taken to the task-list page
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    Then I am on the appeal details sent with payment page
    And I see "Your appeal details have been sent" in title
    And I click on the See your appeal progress link
    Then I should see the appeal overview page

    When I click the Ask for something else link
    Then I should see the Ask for something else page
    When I complete the Ask for something else page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask for something else request page

  Scenario: Ask for the appeal to be reinstated
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
    Then I should see the task-list page
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
    Then I should be taken to the task-list page
    When I go into the Contact details task
    Then I should be taken to the contact-details page
    When I enter text message number "07899999999"
    And I click "Save and continue" button
    Then I should be taken to the task-list page
    When I go into the Decision with or without a hearing task
    Then I should be taken to the decision type page
    When I select a decision with a hearing for a PA pay now appeal
    And I click "Save and continue" button
    Then I should be taken to the pcq-questions page
    When I click "I don't want to answer these questions" button
    And I wait for 5 seconds
    And I go to appeal overview page
    Then I should see the appeal overview page
    And I click continue
    Then I should be taken to the task-list page
    When I go into the Check and send your appeal details task
    Then I should be taken to the check-and-send page
    When I check the statement of truth
    And I submit appeal for a decision with hearing paid appeal
    Then I am on the appeal details submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    When I make a successful payment
    Then I am on the appeal details sent with payment page
    And I see "Your appeal details have been sent" in title
    When I grab the Appeal Reference
    And I sign in as a Case Officer and End the appeal
    Given I am on home page
    And I sign out
    When I click Sign in to continue with your appeal
    Then I should see the sign in page
    And I sign in as the appellant
    When I visit the overview page
    And I click the Ask for the appeal to be reinstated link
    Then I should see the Ask for the appeal to be reinstated page
    When I complete the Ask for the appeal to be reinstated page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask for the appeal to be reinstated request page
