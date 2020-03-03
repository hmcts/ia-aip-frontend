Feature: Footer Links
  In order to know more about the service
  As a citizen
  I should be able to access information pages included on the Footer

Scenario: I am able to navigate through info pages @only
  Given I am on home page
  And I click "Cookies" button
  Then I see "Cookies" in title

  When I click "Terms and conditions" button
  Then I see "Terms and conditions" in title

  When I click "Privacy policy" button
  Then I see "Privacy policy" in title

  When I click "Back" button
  Then I see "Terms and conditions" in title
  
  When I click "Back" button
  Then I see "Cookies" in title

