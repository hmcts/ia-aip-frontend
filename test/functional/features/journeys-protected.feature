Feature: Journeys protected
  In order to access a journey
  As a citizen
  I want to make sure only journeys for a given appeal state are accessible

  Scenario: Appeal Started status should not see Reasons for Appeal page
    Given I have logged in as an appellant in state "appealStarted"
    When I visit reasons for appeal
    Then I see "This page is unavailable" in title

  Scenario: Awaiting Reasons for Appeal status should not see appel details page
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I am on the personal details name page
    Then I see "This page is unavailable" in title
