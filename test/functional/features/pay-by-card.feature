@PayByCard
Feature: Pay by card Appeal submission.
  In order complete my appeal
  As a citizen
  I want to be able to chose decision type and pay for my appeal

  Scenario: Pay by card - Protection Appeal
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
    And I should be able to click "Check and send your appeal"

#    Payment steps
    Given I am on the type of appeal page
    When I select appeal type Protection
    And I click "Save and continue" button
    Then I should see the decision type page
    Then I select decision type with hearing
    And I click "Save and continue" button
    Then I should be taken to the payment options page
    Then I select Yes for pay for the appeal now
    And I click "Save and continue" button
#    Then I should be taken to the payment page

    Then I see "Tell us about your appeal" in title
    And I should be able to click "Check and send your appeal"

#    Then I should see the task-list page

