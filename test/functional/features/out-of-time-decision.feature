Feature: Out of time decision @outOfTimeDecision
  In order complete my appeal
  As a citizen
  I can see the out of time appeal decision

  Scenario: Decision granted @decisionGranted
    Given I have an out of time granted decision appeal
    And I have logged in
    Then I see "/appeal-overview" in current url
    And I see "Pedro Jimeno" in title
    And I see "The tribunal decided your late appeal can continue." in timeline

    When I click "Reasons for decision" link
    Then I see "/out-of-time-decision" in current url
    And I see "Reasons for decision" in title
    And I see "Decision" in summary list
    And I see "The appeal is out of time but can proceed" in summary list
    And I see "Decision Maker" in summary list
    And I see "Tribunal Caseworker" in summary list

    When I click "Back" button
    Then I see "/appeal-overview" in current url

  Scenario: Decision rejected @decisionRejected
    Given I have an out of time rejected decision appeal
    And I have logged in
    Then I see "/appeal-overview" in current url
    And I see "Pedro Jimeno" in title
    And I see "The tribunal decided your late appeal cannot continue." in timeline

    When I click "Reasons for decision" link
    Then I see "/out-of-time-decision" in current url
    And I see "Reasons for decision" in title
    And I see "Decision" in summary list
    And I see "The appeal is out of time and cannot proceed" in summary list
    And I see "Decision Maker" in summary list
    And I see "Tribunal Caseworker" in summary list

    When I click "Back" button
    Then I see "/appeal-overview" in current url

  Scenario: Decision in time @decisionInTime
    Given I have an out of time in-time decision appeal
    And I have logged in
    Then I see "/appeal-overview" in current url
    And I see "Pedro Jimeno" in title
    And I see "The tribunal decided your appeal is in time." in timeline

    When I click "Reasons for decision" link
    Then I see "/out-of-time-decision" in current url
    And I see "Reasons for decision" in title
    And I see "Decision" in summary list
    And I see "The appeal is in time" in summary list
    And I see "Decision Maker" in summary list
    And I see "Tribunal Caseworker" in summary list

    When I click "Back" button
    Then I see "/appeal-overview" in current url
