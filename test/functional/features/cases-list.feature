@casesList
Feature: Cases list page
  In order to manage multiple appeals
  As a citizen
  I want to see a list of my appeals and be able to navigate to each one

  Scenario: User with no cases sees empty cases list
    Given I have logged in as a user with no cases
    Then I should see the cases list page
    And I should see "You do not have any appeals." message
    And I should see "Create a new appeal" link

  Scenario: User with single case sees cases list with one appeal
    Given I have logged in as an appellant in state "appealSubmitted"
    When I visit the cases list page
    Then I should see the cases list page
    And I should see a table with 1 appeal
    And I should see "View" link for the appeal

  Scenario: User with multiple cases sees cases list with all appeals
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    And I should see a table with 3 appeals
    And I should see appeal reference "DRAFT" in the table
    And I should see appeal reference "PA/50100/2024" in the table
    And I should see appeal reference "HU/50200/2024" in the table

  Scenario: User can view a specific appeal from the cases list
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    When I click "View" link for appeal "PA/50100/2024"
    Then I should see the appeal overview page

  Scenario: User can create a new appeal from cases list
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    When I click "Create a new appeal" link
    Then I should see the appeal overview page
    And I see "Do this next" in subheading

  Scenario: Cases list shows correct status for each appeal
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    And I should see status "DRAFT" for appeal "DRAFT"
    And I should see status "Appeal submitted" for appeal "PA/50100/2024"
    And I should see status "Awaiting reasons for appeal" for appeal "HU/50200/2024"

  Scenario: User can navigate back to cases list from overview
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    When I click "View" link for appeal "PA/50100/2024"
    Then I should see the appeal overview page
    When I visit the cases list page
    Then I should see the cases list page
    And I should see a table with 3 appeals
