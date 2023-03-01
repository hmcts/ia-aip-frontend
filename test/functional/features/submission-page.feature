@submitAppeal
Feature: submission
  In order complete my appeal
  As a citizen
  I want to be able to submit my appeal

  Scenario: Submit an appeal
    Given I have an appeal with home office details, name, date of birth, nationality, address and reason for appeal
    And I have logged in
    And I am on the check your answers page
    When I click submit your appeal
    Then I should see error summary
    When I check the statement of truth
    And I click submit your appeal
    Then I am on the appeal details sent page
    And I see "Your appeal details have been sent" in title
    And I see the respond by date is 5 days in the future

  Scenario: Submit an EU/EUSS/HU appeal
    Given I have an EU or EUSS or HU appeal with home office details, name, date of birth, nationality, address and reason for appeal
    And I have logged in
    And I am on the check your answers page
    When I click Submit and continue to pay £80 by debit or credit card
    Then I should see error summary
    When I check the statement of truth
    And I click Submit and continue to pay £80 by debit or credit card
    Then I am on the appeal details sent page
    And I see "Your appeal has been submitted" in title
    And I see the pay by date is 14 days in the future
    When I visit the overview page
    Then I see "Pay for your appeal" link
    And I see "Your appeal details have been sent to the Tribunal" description in overview banner
    And I see "The Tribunal may end your appeal if you do not pay" description in overview banner
