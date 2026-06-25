Feature: Remove self as non-legal representative
  In order to achieve my goals
  As a non-legal representative
  I want be able to remove myself as non-legal representative on an appeal

  Scenario: Remove self as non-legal representative from an appeal
    Given I have logged in as an appellant with email "nlr-login-with-repped-case@example.com"
    Then I should see the Remove myself as non-legal representative link in the appeal overview page
    When I click "Remove myself as non-legal representative" link
    Then I should see Remove yourself as non-legal representative page
    When I click continue
    Then I should see error "Select the checkbox if you understand that removing yourself as non-legal representative will remove your access to this appeal"
    When I check the "I understand that removing myself as non-legal representative on this appeal will remove my access to this case and I will no longer be able to view or track this appeal." option
    And I click continue
    Then I should see the removed yourself as non legal rep confirmation page
    When I click the "Go to your appeals" button
    Then I should see the cases list page



