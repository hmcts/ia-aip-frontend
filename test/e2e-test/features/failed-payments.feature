@nightly-test
Feature: Failed payments
  Scenario: Card type not accepted, Card declined, Card expired, Invalid CVC code, General error
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
    Then I am on the appeal details PA pay now submitted page
    When I click "Pay for this appeal" button
    Then I am on the make payment page
    And I submit a failed payment appeal with Card type not accepted
    Then I see a This card type is not accepted error message

    When I submit a failed payment appeal with Card declined
    Then I see the Your payment has been declined error page

    When I click continue
    Then I should see the appeal overview page
    When I click "Pay for this appeal" link
    Then I am on the make payment page
    And I submit a failed payment appeal with Card expired
    Then I see the Your payment has been declined error page

    When I click continue
    Then I should see the appeal overview page
    When I click "Pay for this appeal" link
    Then I am on the make payment page
    And I submit a failed payment appeal with Invalid CVC code
    Then I see the Your payment has been declined error page

    When I click continue
    Then I should see the appeal overview page
    When I click "Pay for this appeal" link
    Then I am on the make payment page
    And I submit a failed payment appeal with General error
    Then I see the We’re experiencing technical problems error page
