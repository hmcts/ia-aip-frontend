Feature: Personal details enter postcode
In order complete my appeal
As a citizen
I want to be able to enter my postcode

Scenario: Personal details enter postcode
Given I have an appeal with home office details, name, date of birth and nationality
And I have logged in
And I am on the personal details enter postcode page
When I click Save for later
Then I should see the task-list page
And I shouldnt be able to click "Your contact details"

Given I am on the personal details enter postcode page
When I click find address
Then I should see error summary

Given I am on the personal details enter postcode page
When I enter a postcode "CM15 6BN"
And I click find address
Then I should see the select address page

