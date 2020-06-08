Feature: Clarifying questions @only
  In order to complete my appeal
  As a citizen
  I want to be able to answer clarifying questions

  Scenario: Answering Clarifying questions
    Given I have logged in as an appellant in state "awaitingClarifyingQuestionsAnswers"
    Then I see "Pablo Jimenez" in title

    When I click "Continue" button
    Then I see "Questions about your appeal" in title
    Then I see "Answer question 1" item in list
    Then I see "Answer question 2" item in list

    When I click "Answer question 1" link
    Then I see "Question 1" in title
    Then I fill textarea with "my answer"
    Then I click "Save and continue" button
    Then I see "Do you want to provide supporting evidence?" in title
    Then I click "Yes" button
    Then I click "Continue" button
    Then I see "Provide supporting evidence" in title
    Then I choose a file that is "VALID" and click the "Upload file" button
    Then I click "Save and continue" button
    Then I see "Questions about your appeal" in title
    And I see clarifying question "1" saved

    When I click "Answer question 2" link
    Then I see "Question 2" in title
    Then I fill textarea with "my answer for question 2"
    Then I click "Save and continue" button
    Then I see "Do you want to provide supporting evidence?" in title
    Then I click "No" button
    Then I click "Continue" button
    Then I see "Questions about your appeal" in title
    And I see clarifying question "2" saved
    And I see "Do you want to tell us anything else about your case?" link

    When I click "Do you want to tell us anything else about your case?" link
    Then I see "Do you want to tell us anything else about your case?" in title
    Then I click "Yes" button
    Then I click "Continue" button
    Then I see "Do you want to tell us anything else about your case?" in title
    Then I fill textarea with "my answer for anything else question"
    Then I click "Save and continue" button
    Then I see "Questions about your appeal" in title
    Then I see anything else clarifying question saved
    And I see "Check and send your answers" link

    When I click "Check and send your answers" link
    Then I see "You have answered the Tribunal's questions" in title
    Then I click "Send" button
    And I see "You have answered the Tribunal's questions" in title
    Then I click "See your appeal progress" button
    And I see "Pablo Jimenez" in title

  Scenario: Answering Clarifying questions save for later
    Given I have logged in as an appellant in state "awaitingClarifyingQuestionsAnswers"
    Then I see "Pablo Jimenez" in title

    When I click "Continue" button
    Then I see "Questions about your appeal" in title
    Then I see "Answer question 1" item in list
    Then I see "Answer question 2" item in list

    When I click "Answer question 1" link
    Then I see "Question 1" in title
    Then I fill textarea with "my answer"
    Then I click "Save for later" button
    Then I am on the overview page



