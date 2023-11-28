Feature: Online support pages
  In order to understand the process
  As a citizen
  I want to be able to see online support pages

  Scenario: Entering my access needs 3
    Given I have logged in as an appellant in state "awaitingCmaRequirements"
    Given I am on the online support page
    When I click "Next page >" link
    Then I should see the "Getting started - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "The four stages of the new appeal process - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "Notifications - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "Documents - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "Offline processes - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "Guidance - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "How to get help - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I click "Next page >" link
    Then I should see the "How to give feedback - Appeal an immigration or asylum decision - HMCTS" eligibility page


