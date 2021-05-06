@overview
Feature: Overview page
  In order complete my appeal
  As a citizen
  I want to know what stage of the appeal I am at

  Scenario: Appeal Started
    Given I have logged in as an appellant in state "appealStarted"
    When I visit the overview page
    Then I should see the 'do this next section' for 'New - Appeal started'
    And I click continue
    Then I should see the task-list page

  Scenario: Saved Appeal Started
    Given I have logged in as an appellant in state "Saved appealStarted"
    Then I should see the 'do this next section' for 'Saved - Appeal started'
    Then I click continue
    Then I should see the task-list page

  Scenario: Appeal Submitted
    Given I have logged in as an appellant in state "appealSubmitted"
    And I visit the overview page
    Then I should see the 'do this next section' for 'Appeal submitted'
    And I see the respond by date is "31 May 2020"
    When I click "What is a Tribunal Caseworker?" link
    Then I should see the 'Tribunal Caseworker' guidance page
    When I click "Back" button
    Then I should see the appeal overview page


  Scenario: Awaiting Reasons for appeal
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Awaiting reasons for appeal'
    When I click "Understanding your Home Office documents" link
    Then I should see the 'Understanding your Home Office documents' guidance page
    When I click "Back" button
    Then I should see the appeal overview page
    Then I click continue
    Then I should see the reasons for appeal decision page

  Scenario: Saved Awaiting Reasons for appeal
    Given I have logged in as an appellant in state "Saved awaitingReasonsForAppeal"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Saved - Awaiting reasons for appeal'
    When I click "Understanding your Home Office documents" link
    Then I should see the 'Understanding your Home Office documents' guidance page
    When I click "Back" button
    Then I should see the appeal overview page
    Then I click continue
    Then I should see the reasons for appeal decision page

  Scenario: Awaiting Reasons for appeal with time extension
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal with time extensions"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Awaiting reasons for appeal with time extensions' with respond by date '01 January 2020'

  Scenario: Awaiting Clarifying Questions appeal with time extension
    Given I have logged in as an appellant in state "awaitingClarifyingQuestionsAnswers with time extensions"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Awaiting clarifying questions with time extensions' with respond by date '02 May 2020'

  Scenario: Awaiting Cma Requirements appeal
    Given I have logged in as an appellant in state "awaitingCmaRequirements"
    When I visit the overview page
    Then I should see the 'do this next section' for 'awaitingCmaRequirements'
    When I click "What to expect at a case management appointment" link
#    Then I should see the 'What to expect at a case management appointment' guidance page
    When I click "Back" button
    Then I should see the appeal overview page
    Then I click continue
    Then I should see the cma requirements task-list page

  Scenario: Awaiting CMA requirements appeal with time extension
    Given I have logged in as an appellant in state "awaitingCmaRequirements with time extensions"
    When I visit the overview page
    Then I should see the 'do this next section' for 'awaitingCmaRequirements with time extensions' with respond by date '17 June 2020'
