Feature: Type of appeal
  In order complete my appeal
  As a citizen
  I want to be able to enter my type of appeal

  Scenario: Appeal type page

    Given I have logged in
    And I see "Do this next" in subheading
    And I click "Continue" button

    Then I see "Tell us about your appeal" in title
    And I click on the type-of-appeal link
    Then I should be taken to the currently living in the United Kingdom page
    When I select Yes and click continue
    Then I should be taken to the appeal page

    When I click "Save for later" button
    Then I am on the overview page
    Then I click continue
    And I shouldnt be able to click "Check and send your appeal"

#    Given I am on the type of appeal page
#    And I click "Save and continue" button
#    Then I should see error summary
#
#    Given I am on the type of appeal page
#    When I select appeal type Protection
#    And I click "Save for later" button
#    Then I am on the overview page
#    Then I click continue
#    And I should be able to click "Check and send your appeal"
#
#    Given I am on the type of appeal page
#    When I select appeal type Protection
#    And I click "Save and continue" button
#    Then I should see the task-list page
#    And I should be able to click "Check and send your appeal"
