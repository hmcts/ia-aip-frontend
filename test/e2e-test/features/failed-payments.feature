@nightly-test
Feature: Failed payments
  Scenario: Card type not accepted, Card declined, Card expired, Invalid CVC code, General error
    Given I am on home page
    When I click Sign in to continue with your appeal
    Then I should see the sign in page
    When I have WIP logged in as an appellant in state "pendingPayment"
    Then I should see the appeal overview page

    When I click "Pay for this appeal" link
    Then I am on the make payment page
    And I submit a failed payment appeal with Card type not accepted
    Then I see a This card type is not accepted error message

    When I submit a failed payment appeal with Card declined
    Then I see the Your payment has been declined error page
    When I click continue
    And I go to appeal overview page
    Then I should see the appeal overview page

    When I click "Pay for this appeal" link
    Then I am on the make payment page
    When I submit a failed payment appeal with Card expired
    Then I see the Your payment has been declined error page
    When I click continue
    And I go to appeal overview page
    Then I should see the appeal overview page

    When I click "Pay for this appeal" link
    Then I am on the make payment page
    When I submit a failed payment appeal with Invalid CVC code
    Then I see the Your payment has been declined error page
    When I click continue
    And I go to appeal overview page
    Then I should see the appeal overview page

    When I click "Pay for this appeal" link
    Then I am on the make payment page
    When I submit a failed payment appeal with General error
    Then I see the We’re experiencing technical problems error page
