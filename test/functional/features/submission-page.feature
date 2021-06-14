Feature: submission
  In order complete my appeal
  As a citizen
  I want to be able to submit my appeal

  Scenario: Submit an appeal
    Given I have an appeal with home office details, name, date of birth, nationality, address and reason for appeal
    And I have logged in
    And I am on the check your answers page
    When I click send
    Then I should see error summary
    When I check the statement of truth
    And I click send
    Then I am on the appeal details sent page
    And I see "Your appeal details have been sent" in title
    And I see the respond by date is 5 days in the future
