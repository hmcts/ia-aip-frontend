@nightly-test
Feature: Make an application
  Scenario: Ask to withdraw
    Given I am on home page
    When I have logged in for the e2e as an appellant in state "appealSubmitted"
    Then I should see the appeal overview page

    When I click the Withdraw my appeal link
    Then I should see the Ask to withdraw the appeal page
    And I check page accessibility
    When I complete the Ask to withdraw the appeal page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    And I check page accessibility
    When I select No and click continue
    Then I see "Check your answer" in title
    And I check page accessibility
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    And I check page accessibility
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask to withdraw the appeal request page
    And I check page accessibility
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to change some of your details
    Given I am on home page
    When I have logged in for the e2e as an appellant in state "appealSubmitted"
    Then I should see the appeal overview page

    When I click the Ask to change some of your details link
    Then I should see the Ask to change some of your details page
    And I check page accessibility
    When I complete the Ask to change some of your details page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask to change some of your details request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to link or unlink
    Given I am on home page
    When I have logged in for the e2e as an appellant in state "appealSubmitted"
    Then I should see the appeal overview page

    When I click the Ask to link or unlink with another appeal link
    Then I should see the Ask to link or unlink this appeal page
    And I check page accessibility
    When I complete the Ask to link or unlink this appeal page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask to link or unlink this appeal request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to get judge to review
    Given I am on home page
    When I have logged in for the e2e as an appellant in state "appealSubmitted"
    Then I should see the appeal overview page

    When I click the Ask for a judge to review a decision by a Tribunal Caseworker link
    Then I should see the Ask for a judge to review a decision page
    And I check page accessibility
    When I complete the Ask for a judge to review a decision page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask for a judge to review a decision request page
    When I click the back button
    Then I should see the appeal overview page

  Scenario: Ask to do something else
    Given I am on home page
    When I have logged in for the e2e as an appellant in state "appealSubmitted"
    Then I should see the appeal overview page

    When I click the Ask for something else link
    Then I should see the Ask for something else page
    And I check page accessibility
    When I complete the Ask for something else page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask for something else request page

  Scenario: Ask for the appeal to be reinstated
    Given I am on home page
    When I have logged in for the e2e as an appellant in state "ended"
    Then I should see the appeal overview page
    And I check page accessibility
    When I click the Ask for the appeal to be reinstated link
    Then I should see the Ask for the appeal to be reinstated page
    And I check page accessibility
    When I complete the Ask for the appeal to be reinstated page
    And I click "Continue" button
    Then I should see the Do you want to provide supporting evidence for this request page
    When I select No and click continue
    Then I see "Check your answer" in title
    When I click "Confirm and send" button
    Then I should see the Your request has been sent to the Tribunal page
    When I click on the See your appeal progress link
    Then I should see You sent the Tribunal a request
    When I click "Your request" link
    Then I should see the Ask for the appeal to be reinstated request page
