Feature: Personal details enter postcode
  In order complete my appeal
  As a citizen
  I want to be able to enter my postcode

  Scenario: Entering postcode should open next page
    Given I have logged in as an appellant with email "appealWithHomeOfficeDetailsNameDateOfBirthAndNationality@example.com"
    And I am on the personal details enter postcode page
    When I click "Save for later" button
    And I check page accessibility
    Then I am on the overview page
    Then I click continue
    And I check page accessibility
    Then I should see the task-list page
    And I shouldnt be able to click "Your contact details"
    And I check page accessibility

    Given I am on the personal details enter postcode page
    When I click find address
    And I check page accessibility
    Then I should see error summary

    Given I am on the personal details enter postcode page
    When I enter a postcode "CM15 6BN"
    And I click find address
    And I check page accessibility
    Then I should see the select address page

