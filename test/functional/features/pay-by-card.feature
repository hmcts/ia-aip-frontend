@PayByCard
Feature: Pay by card Appeal submission.
  In order complete my appeal
  As a citizen
  I want to be able to chose decision type and pay for my appeal

  Scenario: Pay by card - Protection Appeal - Pay Later Option
    Given I have an appeal with home office details, personal details and contact details
    And I have logged in
    And I am on the type of appeal page
    When I click "Save for later" button
    Then I am on the overview page
    Then I click continue
    And I shouldnt be able to click "Check and send your appeal"

    Given I am on the type of appeal page
    And I click "Save and continue" button
    Then I should see error summary

    Given I am on the type of appeal page
    When I select appeal type Protection
    And I click "Save for later" button
    Then I am on the overview page
    Then I click continue

#    Payment steps
    Given I am on the type of appeal page
    When I select appeal type Protection
    And I click "Save and continue" button
    Then I should see the decision type page
    Then I select decision type without hearing
    And I click "Save and continue" button
    Then I should be taken to the payment options page
    When I select No for pay for the appeal now
    And I click "Save and continue" button
    Then I see "Tell us about your appeal" in title
    And I should be able to click "Check and send your appeal"
    When I click on the check and send your appeal link
    Then I should be taken to the check-and-send page
    Then I check the statement of truth
    When I click send
    Then I see confirmation page

  Scenario: Pay by card - Protection Appeal - Pay Now
    Given I have an appeal with home office details, personal details and contact details
    And I have logged in
    And I am on the type of appeal page
    When I click "Save for later" button
    Then I am on the overview page
    Then I click continue
    And I shouldnt be able to click "Check and send your appeal"

    Given I am on the type of appeal page
    And I click "Save and continue" button
    Then I should see error summary

    Given I am on the type of appeal page
    When I select appeal type Protection
    And I click "Save for later" button
    Then I am on the overview page
    Then I click continue

#    Payment steps
    Given I am on the type of appeal page
    When I click on Protection as my type of appeal and click Save and continue
    Then I should see the decision type page
    Then I select decision type with hearing
    And I click "Save and continue" button
    Then I should be taken to the payment options page
    When I select Yes for pay for the appeal now
    And I click "Save and continue" button
    Then I see "Tell us about your appeal" in title
    And I should be able to click "Check and send your appeal"
    When I click on the check and send your appeal link
    Then I should be taken to the check-and-send page
    Then I check the statement of truth
    When I click Submit and continue to pay £140 by debit or credit card
#    Then I should be taken to the Enter card details

  Scenario: Pay by card - Revocation of Protection Status
    Given I have an appeal with home office details, personal details and contact details
    And I have logged in
    And I am on the type of appeal page
    When I click "Save for later" button
    Then I am on the overview page
    Then I click continue
    And I shouldnt be able to click "Check and send your appeal"

    Given I am on the type of appeal page
    And I click "Save and continue" button
    Then I should see error summary

    Given I am on the type of appeal page
    When I select appeal type Protection
    And I click "Save for later" button
    Then I am on the overview page
    Then I click continue

    Given I am on the type of appeal page
    When I select appeal type Revocation of Protection Status
    And I click "Save and continue" button
    Then I should see the decision type page
    Then I select decision type with hearing
    And I click "Save and continue" button
    Then I see "Tell us about your appeal" in title
    And I should be able to click "Check and send your appeal"
    When I click on the check and send your appeal link
    Then I should be taken to the check-and-send page
    Then I check the statement of truth
    When I click send
    Then I see confirmation page your appeal details have been sent


  Scenario: Pay by card - Deprivation of Citizenship
    Given I have an appeal with home office details, personal details and contact details
    And I have logged in
    And I am on the type of appeal page
    When I click "Save for later" button
    Then I am on the overview page
    Then I click continue
    And I shouldnt be able to click "Check and send your appeal"

    Given I am on the type of appeal page
    And I click "Save and continue" button
    Then I should see error summary

    Given I am on the type of appeal page
    When I select appeal type Deprivation of Citizenship
    And I click "Save and continue" button
    Then I should see the decision type page
    Then I select decision type with hearing
    And I click "Save and continue" button
    Then I see "Tell us about your appeal" in title
    And I should be able to click "Check and send your appeal"
    When I click on the check and send your appeal link
    Then I should be taken to the check-and-send page
    Then I check the statement of truth
    When I click send
    Then I see confirmation page your appeal details have been sent
