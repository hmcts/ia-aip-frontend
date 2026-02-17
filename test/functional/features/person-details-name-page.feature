Feature: Personal details name page
  In order complete my appeal
  As a citizen
  I want to be able to enter my name

  Scenario: Entering name should open next page
    Given I have logged in as an appellant with email "appealWithHomeOfficeDetails@example.com"
    And I am on the personal details name page
    When I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"
    And I check page accessibility

    Given I am on the personal details name page
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see error summary

    Given I am on the personal details name page
    When I enter given name "Bob" family name "Smith"
    And I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"
    And I check page accessibility

    Given I am on the personal details name page
    When I enter given name "Bob" family name "Smith"
    And I click "Save and continue" button
    And I check page accessibility
    Then I should see the date of birth page
