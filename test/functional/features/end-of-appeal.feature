Feature: End of appeal @endappeal
  In order complete my appeal
  As a citizen
  I want to be able to enter my type of appeal

  Scenario: Home office reference page
    Given I have an ended appeal
    And I have logged in
    Then I see "Pedro Jimeno" in title
    And I see "Do this next" in subheading

    And I see "Your appeal was ended" in timeline
    And I click "Notice of Ended Appeal" link
    Then I see "Notice of Ended Appeal" in title

    And I see "Date uploaded" in summary list
    And I see "01 June 2021" in summary list
    And I see "Document" in summary list
    And I see "PA 50002 2021-perez-NoticeOfEndedAppeal(PDF)" in summary list
    And I click "Back" button
    Then I see "Pedro Jimeno" in title
