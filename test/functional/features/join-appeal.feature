Feature: Join appeal as a non-legal representative
  In order to achieve my goals
  As a non-legal representative
  I want be able to join an ongoing appeal

  Scenario: Join appeal
    Given I have logged in as an appellant with email "appeal-submitted@example.com"
    And I visit the cases list page
    When I click the Join appeal nav link
    Then I should be taken to the join appeal page
    And I check page accessibility
    When I click the "Back to view appeals" link
    Then I should see the cases list page
    When I click the "Join an existing appeal" button
    Then I should be taken to the join appeal page
    And I should see the join appeal page content

    When I click the Join appeal button
    Then I should see error "The Online case reference number cannot be empty"
    And I should see error "The access code cannot be empty"

    When I fill the online-case-reference-number field with "invalid-case-reference"
    And I fill the access-code field with "invalid-access-code"
    And I click the Join appeal button
    Then I should see error "The Online case reference number you have entered is not valid or does not exist. Please check the number and try again."

    When I fill the online-case-reference-number field with "3"
    And I click the Join appeal button
    Then I should see error "You already have access to this appeal as an appellant or a non-legal representative. Please check your appeals list to access the appeal."

    When I fill the online-case-reference-number field with "1234-1234-1234-1234"
    And I click the Join appeal button
    Then I should see error "The Online case reference number you have entered is not valid or does not exist. Please check the number and try again."

    When I fill the online-case-reference-number field with "1111-1111-1111-1111"
    And I click the Join appeal button
    Then I should see error "There is no access code for the case with the reference 1111-1111-1111-1111. Please ask the appellant to invite you to join the appeal."

    When I fill the online-case-reference-number field with "1111 1111 2222 2222"
    And I click the Join appeal button
    Then I should see error "Your details are not attached to the case with the reference 1111 1111 2222 2222. Please ask the appellant to invite you to join the appeal."

    When I fill the online-case-reference-number field with "2222 2222 2222 2222"
    And I click the Join appeal button
    Then I should see error "The access code provided is not valid for the case with the reference 2222 2222 2222 2222. Please try entering it again."

    When I fill the online-case-reference-number field with "3333333333333333"
    And I fill the access-code field with "valid-access-code"
    And I click the Join appeal button
    Then I should see error "The access code provided for the case with the reference 3333333333333333 has already been used. Please ask the appellant to invite you to join the appeal again."

    When I fill the online-case-reference-number field with "44 44-4444-4 444-4444"
    And I click the Join appeal button
    Then I should see error "The access code provided for the case with the reference 44 44-4444-4 444-4444 has expired. Please ask the appellant to invite you to join the appeal again."

    When I fill the online-case-reference-number field with "5555-55555555-5555"
    And I click the Join appeal button

    Then I should be taken to the join appeal confirm details page
    And I should see the case reference number "5555-5555-5555-5555" on the page
    And I should see the correct appeal reference on the page
    And I should see the correct appellant's name on the page

    When I click the "Confirm details" button
    Then I should see the join appeal confirmation page

    When I click the "Go to your appeals" button
    Then I should see the cases list page
