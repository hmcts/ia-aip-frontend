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
    And I see the respond by date is "11 March 2020"

  Scenario: Awaiting Reasons for appeal
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Awaiting reasons for appeal'
    Then I click continue
    Then I should see the reasons for appeal decision page

  Scenario: Awaiting Reasons for appeal
    Given I have logged in as an appellant in state "Saved awaitingReasonsForAppeal"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Saved - Awaiting reasons for appeal'
    Then I click continue
    Then I should see the reasons for appeal decision page
