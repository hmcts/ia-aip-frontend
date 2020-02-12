Feature: Overview page
  In order complete my appeal
  As a citizen
  I want to know what stage of the appeal I am at

  Scenario: Appeal Started
#    New Appeal Started
    Given I have logged in as an appellant in state "New appealStarted"
    When I visit the overview page
    Then I should see the 'do this next section' for 'New - Appeal started'
    And I click continue
    Then I should see the task-list page

#  Scenario: Saved Appeal Started
#    Given I have logged in as an appellant in state "Saved AppealStarted"
#    Then I should see the 'do this next section' for 'Saved - Appeal started'
#    Then I click continue
#    Then I should see the task-list page

  Scenario: Appeal Submitted
    Given I have logged in as an appellant in state "appealSubmitted"
    And I visit the overview page
    Then I should see the 'do this next section' for 'Appeal submitted'


