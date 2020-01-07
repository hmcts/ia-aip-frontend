Feature: Reason for appeal
  In order to give my reason for appeal
  As a citizen
  I want to be able to fill in the reason text field

  Scenario: Navigate through reasons for appeal
    Given I am authenticated as a valid appellant
    When I visit reasons for appeal
    Then I enter "" into the reason for appeal text box and click Save and Continue
    Then I should see error summary

    When I click save for later
    Then I should see error summary

    When I click the back button on reasons for appeal
    Then I should be taken to the appllent timeline

    When I visit reasons for appeal
    Then I enter "Test" into the reason for appeal text box and click Save and Continue
    Then I should see the additional evidence page


