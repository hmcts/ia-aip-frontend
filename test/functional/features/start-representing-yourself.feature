@startRepresentingYourself
Feature: Start Representing Yourself
  In order to start representing myself after legal representation has been removed
  As a citizen
  I want to be able to enter the case reference and access code to take over the case

  Scenario: Complete the Start Representing Yourself process
    When I visit the start-representing-yourself page
    Then I see "Start representing yourself" in title

    # proceed to enter case reference number page
    When I click the "Start now" button
    Then I see "/start-representing-yourself/enter-case-number" in current url
    And I see "Enter your online case reference number" in title

    # entered incorrectly formatted case reference number
    When I fill "caseReferenceNumber" field with "1234-invalid-1234"
    And I click the "Continue" button
    Then I should see error summary

    # case with expired pip
    # entered correctly formatted case reference number
    When I fill "caseReferenceNumber" field with "1111-2222-3333-4444"
    And I click the "Continue" button
    Then I see "/start-representing-yourself/enter-security-code" in current url
    And I see "Enter your security code" in title

    # entered incorrectly formatted access code
    When I fill "accessCode" field with "INVALID"
    And I click "Continue" button
    Then I should see error summary

    # entered correctly formatted access code
    When I fill "accessCode" field with "ABCD1234EFGH"
    And I click "Continue" button
    Then I see "/start-representing-yourself/enter-case-number?error=pipValidationFailed" in current url
    And I should see error summary

    # case with valid pip
    # entered valid case reference number
    When I fill "caseReferenceNumber" field with "1234-1234-1234-1234"
    And I click the "Continue" button
    Then I see "/start-representing-yourself/enter-security-code" in current url
    And I see "Enter your security code" in title

    # entered valid access code
    When I fill "accessCode" field with "ABCD1234EFGH"
    And I click "Continue" button
    Then I see "/start-representing-yourself/confirm-case-details" in current url
    And I see "Confirm case details" in title

    # confirm case details
    And I click "Confirm" button
    Then I see "/login" in current url