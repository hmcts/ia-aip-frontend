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
    And I check page accessibility
    Then I should see the task-list page

  Scenario: Saved Appeal Started
    Given I have logged in as an appellant in state "Saved appealStarted"
    Then I should see the 'do this next section' for 'Saved - Appeal started'
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page

  Scenario: Appeal Submitted
    Given I have logged in as an appellant in state "appealSubmitted"
    And I visit the overview page
    Then I should see the 'do this next section' for 'Appeal submitted'
    And I see the respond by date is "09 June 2020"
    When I click "What is a Tribunal Caseworker?" link
    And I check page accessibility
    Then I should see the 'Tribunal Caseworker' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page


  Scenario: Awaiting Reasons for appeal
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Awaiting reasons for appeal'
    When I click "Understanding your Home Office documents" link
    And I check page accessibility
    Then I should see the 'Understanding your Home Office documents' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page
    Then I click continue
    And I check page accessibility
    Then I should see the reasons for appeal decision page

  Scenario: Saved Awaiting Reasons for appeal
    Given I have logged in as an appellant in state "Saved awaitingReasonsForAppeal"
    When I visit the overview page
    Then I should see the 'do this next section' for 'Saved - Awaiting reasons for appeal'
    When I click "Understanding your Home Office documents" link
    And I check page accessibility
    Then I should see the 'Understanding your Home Office documents' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page
    Then I click continue
    And I check page accessibility
    Then I should see the reasons for appeal decision page

  # Scenario: Awaiting Reasons for appeal with time extension
  #   Given I have logged in as an appellant in state "awaitingReasonsForAppeal with time extensions"
  #   When I visit the overview page
  #   Then I should see the 'do this next section' for 'Awaiting reasons for appeal with time extensions' with respond by date '01 January 2020'

  # Scenario: Awaiting Clarifying Questions appeal with time extension
  #   Given I have logged in as an appellant in state "awaitingClarifyingQuestionsAnswers with time extensions"
  #   When I visit the overview page
  #   Then I should see the 'do this next section' for 'Awaiting clarifying questions with time extensions' with respond by date '02 May 2020'

  Scenario: Awaiting Cma Requirements appeal
    Given I have logged in as an appellant in state "awaitingCmaRequirements"
    When I visit the overview page
    Then I should see the 'do this next section' for 'awaitingCmaRequirements'
    When I click "What to expect at a case management appointment" link
    And I check page accessibility
#    Then I should see the 'What to expect at a case management appointment' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page
    Then I click continue
    And I check page accessibility
    Then I should see the cma requirements task-list page

  Scenario: Appeal Submitted Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "appealSubmitted with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for "appealSubmitted" when statutory timeframe 24 weeks is Yes
    When I click "What is a Legal Officer?" link
    And I check page accessibility
    Then I should see the 'Tribunal Caseworker' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Late Appeal Submitted Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "lateAppealSubmitted with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for "lateAppealSubmitted" when statutory timeframe 24 weeks is Yes
    When I click "What is a Legal Officer?" link
    And I check page accessibility
    Then I should see the 'Tribunal Caseworker' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Awaiting Respondent Evidence Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "awaitingRespondentEvidence with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for "awaitingRespondentEvidence" when statutory timeframe 24 weeks is Yes
    When I click "What is a Legal Officer?" link
    And I check page accessibility
    Then I should see the 'Tribunal Caseworker' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Listing Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "listing with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for "listing" when statutory timeframe 24 weeks is Yes
    When I click "What to expect at a hearing" link
    Then I should see the 'What to expect at your hearing' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Awaiting Reasons For Appeal Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "awaitingReasonsForAppeal with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'awaitingReasonsForAppeal' when statutory timeframe 24 weeks is Yes
    When I click "Understanding your Home Office documents" link
    And I check page accessibility
    Then I should see the 'Understanding your Home Office documents' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Reasons For Appeal Submitted Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "reasonsForAppealSubmitted with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for "reasonsForAppealSubmitted" when statutory timeframe 24 weeks is Yes
    And I check page accessibility

  Scenario: Case Under Review Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "caseUnderReview with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for "caseUnderReview" when statutory timeframe 24 weeks is Yes
    And I check page accessibility

  Scenario: Respondent Review Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "respondentReview with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for 'respondentReview' when statutory timeframe 24 weeks is Yes
    When I click "What happens if the Home Office withdraw their decision" link
    And I check page accessibility
    Then I should see the 'What happens if the Home Office withdraw their decision' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Decision Maintained Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "decisionMaintained with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'decisionMaintained' when statutory timeframe 24 weeks is Yes
    When I click "What happens if the Home Office maintain their decision" link
    And I check page accessibility
    Then I should see the 'What happens if the Home Office maintain their decision' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Awaiting Reasons For Appeal Partial Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "awaitingReasonsForAppealPartial with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'awaitingReasonsForAppealPartial' when statutory timeframe 24 weeks is Yes
    When I click "Understanding your Home Office documents" link
    And I check page accessibility
    Then I should see the 'Understanding your Home Office documents' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Prepare For Hearing Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "prepareForHearing with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'prepareForHearing' and 'finalBundling' when statutory timeframe 24 weeks is Yes
    When I click "What to expect at a hearing" link
    Then I should see the 'What to expect at your hearing' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Final Bundling Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "finalBundling with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'prepareForHearing' and 'finalBundling' when statutory timeframe 24 weeks is Yes
    When I click "What to expect at a hearing" link
    Then I should see the 'What to expect at your hearing' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Pending Payment Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "pendingPayment with stf24w"
    And I visit the overview page
    Then I should see the 'nothing to do next section' for 'pendingPayment' when statutory timeframe 24 weeks is Yes
    When I click "What is a Legal Officer?" link
    And I check page accessibility
    Then I should see the 'Tribunal Caseworker' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Submit Hearing Requirements Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "submitHearingRequirements with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'submitHearingRequirements' when statutory timeframe 24 weeks is Yes
    Then I should not see the 'ask for more time' link
    When I click "What to expect at a hearing" link
    Then I should see the 'What to expect at your hearing' guidance page
    When I click "Back" button
    And I check page accessibility
    Then I should see the appeal overview page

  Scenario: Awaiting Clarifying Questions Answers Statutory Timeframe 24 Weeks
    Given I have logged in as an appellant in state "awaitingClarifyingQuestionsAnswers with stf24w"
    And I visit the overview page
    Then I should see the 'do this next section' for 'awaitingClarifyingQuestionsAnswers' when statutory timeframe 24 weeks is Yes
    Then I should not see the 'ask for more time' link
    And I check page accessibility

  # Scenario: Awaiting CMA requirements appeal with time extension
  #   Given I have logged in as an appellant in state "awaitingCmaRequirements with time extensions"
  #   When I visit the overview page
  #   Then I should see the 'do this next section' for 'awaitingCmaRequirements with time extensions' with respond by date '17 June 2020'
