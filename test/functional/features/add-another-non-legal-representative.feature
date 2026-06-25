Feature: Add another non-legal representative
  In order to achieve my goals
  As a citizen
  I want be able to add a new non-legal representative to my appeal

  Scenario: Add a new non-legal representative with active NLR
    Given I have logged in as an appellant with email "appeal-submitted-with-active-nlr@example.com"
    And I click "Add a non-legal representative" link
    Then I should be taken to the add another non legal representative page
    When I click continue
    Then I should see error "Select the checkbox if you understand that adding another non-legal representative will remove the access of the current non-legal representative to the appeal"
    When I check the "I understand that adding another non-legal representative will remove the current non-legal representative's access to my case and they will no longer be able to view or track my appeal." option
    And I click continue
    Then I should be taken to the add non legal representative page
    And I should see the add non legal representative page content



