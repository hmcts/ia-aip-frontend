Feature: CMA Access needs
  In order complete my access needs
  As a citizen
  I want to be able to fill in access needs

  Scenario: Entering my access needs 1
    Given I have logged in as an appellant in state "awaitingCmaRequirements"
    Given I am on the access needs page
    Then I click continue
    Then I should see the "Will you or anyone coming with you need an interpreter? - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I select No and click save and continue
    Then I should see the "Add language details - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I select from the drop-down
    When I click "Save and continue" button
    Then I should see the "Will you or anyone coming with you need step-free access?" eligibility page
    When I select Yes and click save and continue
    Then I should see the "Will you or anyone coming with you need a hearing loop?" eligibility page
    When I select Yes and click save and continue
    Then I should see the "Tell us your appointment needs - Appeal an immigration or asylum decision - HMCTS" eligibility page


  Scenario: Entering my access needs 2
    Given I have logged in as an appellant in state "awaitingCmaRequirements"
    Given I am on the access needs page
    Then I click continue
    Then I should see the "Will you or anyone coming with you need an interpreter? - Appeal an immigration or asylum decision - HMCTS" eligibility page
    When I select Yes and click save and continue
    Then I should see the "Will you or anyone coming with you need step-free access?" eligibility page
    When I select Yes and click save and continue
    Then I should see the "Will you or anyone coming with you need a hearing loop?" eligibility page
    When I select Yes and click save and continue
    Then I should see the "Tell us your appointment needs - Appeal an immigration or asylum decision - HMCTS" eligibility page

