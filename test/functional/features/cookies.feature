@cookies
Feature: Cookies banner
  As a citizen
  I should be able to accept, reject and read cookies in this service

Background: I am able to navigate through info pages
  Given I have logged in

  And I see "Do this next" in subheading

Scenario: I view cookies and accept them
  And I see "Cookies on MyHMCTS" in subheading
  And I click "View cookies" button
  Then I see "Cookies" in title

  And I click "Accept analytics cookies" button
  Then I dont see "Cookies on MyHMCTS" on the page

Scenario: I accept analytics cookie 1
  And I see "Cookies on MyHMCTS" in subheading
  And I click "Accept analytics cookies" button
  Then I dont see "Cookies on MyHMCTS" on the page

Scenario: I reject analytics cookie
  And I see "Cookies on MyHMCTS" in subheading
  And I click "Reject analytics cookies" button
  Then I dont see "Cookies on MyHMCTS" on the page
