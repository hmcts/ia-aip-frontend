Feature: Remove a non-legal representative
  In order to achieve my goals
  As a citizen
  I want be able to remove my non-legal representative from my appeal

  Scenario: Remove non-legal representative without active NLR
    Given I have logged in as an appellant with email "appeal-submitted-with-nlr-details@example.com"
    Then I should not see the Remove non-legal representative link in the appeal overview page

  Scenario: Remove non-legal representative with active NLR
    Given I have logged in as an appellant with email "appeal-submitted-with-active-nlr@example.com"
    Then I should see the Remove non-legal representative link in the appeal overview page
    When I click "Remove my non-legal representative" link
    Then I should see Remove your non-legal representative page
    When I click continue
    Then I should see error "Select the checkbox if you understand that removing your non-legal representative will remove their access to this appeal"
    When I check the "I understand that removing my non-legal representative will remove their access to my case and they will no longer be able to view or track my appeal." option
    And I click continue
    Then I should see the removed your non legal rep confirmation page
    When I click on the See your appeal progress link
    Then I should see the appeal overview page



