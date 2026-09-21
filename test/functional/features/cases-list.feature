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
    And I should see the "Your appeals" h2 heading
    And I should not see the "Appeals you're representing" h2 heading
    And I should see 1 table
    And I should see 1 appeal in table 1
    And I should see "View" link for the appeal

  Scenario: User with single NLR case sees cases list with one repped appeal
    Given I have logged in as a user with one repped appeal
    When I visit the cases list page
    Then I should see the cases list page
    And I should not see the "Your appeals" h2 heading
    And I should see the "Appeals you're representing" h2 heading
    And I should see 1 table
    And I should see 1 appeal in table 1
    And I should see "View" link for the appeal

  Scenario: User with multiple cases sees cases list with all appeals repped and unrepped
    Given I have logged in as a user with multiple appeals both repped and unrepped
    Then I should see the cases list page
    And I should see the "Your appeals" h2 heading
    And I should see the "Appeals you're representing" h2 heading
    And I should see 2 tables
    And I should see 2 appeals in table 1
    And I should see 1 appeal in table 2
    And I should see appeal reference "DRAFT" in table 1
    And I should see appeal reference "PA/50100/2024" in table 2
    And I should see appeal reference "HU/50200/2024" in table 1

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
    Then I should see the confirm create appeal popup
    When I click cancel on the confirm create appeal popup
    Then I should see the cases list page
    When I click the Create appeal nav link
    Then I should see the confirm create appeal popup
    When I click confirm on the confirm create appeal popup
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
    When I click the "Back to view appeals" link
    Then I should see the cases list page
    And I should see a table with 3 appeals

  Scenario: User can navigate back to cases list from overview nav link
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    When I click "View" link for appeal "PA/50100/2024"
    Then I should see the appeal overview page
    When I click the View appeals nav link
    Then I should see the cases list page
    And I should see a table with 3 appeals

  Scenario: User with multiple cases can delete draft appeal from cases list
    Given I have logged in as a user with multiple appeals
    Then I should see the cases list page
    And I should see a table with 3 appeals
    And I should see appeal reference "DRAFT" in the table
    And I should see appeal reference "PA/50100/2024" in the table
    And I should see appeal reference "HU/50200/2024" in the table
    And I should see "Delete" link for appeal "DRAFT"
    And I should not see "Delete" link for appeal "PA/50100/2024"
    And I should not see "Delete" link for appeal "HU/50200/2024"
    When I click "Delete" link for appeal "DRAFT"
    Then I should see the confirm delete draft popup with case id "1001"
    When I click cancel on the confirm delete draft popup
    Then I should see the cases list page
    When I click "Delete" link for appeal "DRAFT"
    Then I should see the confirm delete draft popup with case id "1001"
    When I click confirm on the confirm delete draft popup
    Then I should see the cases list page

