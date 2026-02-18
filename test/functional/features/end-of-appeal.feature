Feature: End of appeal @endappeal
  In order complete my appeal
  As a citizen
  I want to be able to enter my type of appeal

  Scenario: Ended appeal
    Given I have logged in as an appellant with email "endedAppeal@example.com"
    Then I see "Pedro Jimeno" in title
    And I see "Do this next" in subheading

    And I see "Your appeal was ended" in timeline
    And I click "Notice of Ended Appeal" link
    And I check page accessibility
    Then I see "Notice of Ended Appeal" in title

    And I see "Date uploaded" in summary list
    And I see "01 June 2021" in summary list
    And I see "Document" in summary list
    And I see "PA 50002 2021-perez-NoticeOfEndedAppeal(PDF)" in summary list
    And I click "Back" button
    And I check page accessibility
    Then I see "Pedro Jimeno" in title
