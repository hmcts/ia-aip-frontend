@clarifyingQuestions
Feature: Clarifying questions
  In order to complete my appeal
  As a citizen
  I want to be able to answer clarifying questions

  Background:
    Given I have logged in as an appellant in state "awaitingClarifyingQuestionsAnswers"
    Then I see "Pablo Jimenez" in title
    When I click "Continue" button
    Then I see "Questions about your appeal" in title
    Then I see "Answer question 1" item in list
    Then I see "Answer question 2" item in list

  Scenario: Answering Clarifying questions
    When I click "Answer question 1" link
    Then I see "Question 1" in title

    When I fill textarea with "my answer"
    And I click "Save and continue" button
    Then I see "Do you want to provide supporting evidence?" in title

    When I click "Yes" button
    And I click "Continue" button
    Then I see "Provide supporting evidence" in title

    When I choose a file that is "VALID" and click the "Upload file" button
    And I click "Save and continue" button
    Then I see "Questions about your appeal" in title
    And I see clarifying question "1" saved

    When I click "Answer question 2" link
    Then I see "Question 2" in title

    When I fill textarea with "my answer for question 2"
    And I click "Save and continue" button
    Then I see "Do you want to provide supporting evidence?" in title

    When I click "No" button
    And I click "Continue" button
    Then I see "Questions about your appeal" in title
    And I see clarifying question "2" saved
    And I see "Do you want to tell us anything else about your case?" link

    When I click "Do you want to tell us anything else about your case?" link
    Then I see "Do you want to tell us anything else about your case?" in title

    When I click "Yes" button
    And I click "Continue" button
    Then I see "Do you want to tell us anything else about your case?" in title

    When I fill textarea with "my answer for anything else question"
    And I click "Save and continue" button
    Then I see "Do you want to provide supporting evidence?" in title

    When I click "Yes" button
    And I click "Continue" button
    Then I see "Provide supporting evidence" in title

    When I choose a file that is "VALID" and click the "Upload file" button
    And I click "Save and continue" button
    Then I see "Questions about your appeal" in title
    And I see anything else clarifying question saved
    And I see "Check and send your answers" link

    When I click "Check and send your answers" link
    Then I see "You have answered the Tribunal's questions" in title

    When I click "Send" button
    Then I see "You have answered the Tribunal's questions" in title

    When I click "See your appeal progress" button
    Then I see "Pablo Jimenez" in title
    And I see "A Tribunal Caseworker is looking at your answers and will contact you to tell you what to do next" description in overview banner

  Scenario: Answering Clarifying questions save for later
    When I click "Answer question 1" link
    Then I see "Question 1" in title

    When I fill textarea with "my answer"
    And I click "Save for later" button
    Then I am on the overview page

  Scenario: Ask for more time while answering Clarifying questions
    When I click "Answer question 1" link
    And I see "Question 1" in title
    And I fill textarea with "my answer"
    And I click "Save your answer and ask for more time" button
    Then I see "Ask for more time" in title

    And I fill textarea with "my reson for more time"
    And I click "Continue" button
    Then I see "Do you want to provide supporting evidence for why you need more time" in title

    And I click "No" button
    And I click "Continue" button
    Then I see "Check your answer" in title

    And I click "Send" button
    Then I see "Your request has been sent to the Tribunal" in title

    And I click "See your appeal progress" button
    Then I see "Pablo Jimenez" in title
    And I see "You have saved your answers and asked for more time" on the page
