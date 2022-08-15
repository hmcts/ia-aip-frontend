@changeRepresentationFeature
Feature: Change Representation
  In order to change representation
  As a citizen
  I want to be able to have access guidance on what to do if I stop representing myself

  Scenario: Access guidance on what to do if I stop representing myself
    Given I have logged in as an appellant in state "preHearing"
    When I click the I am no longer representing myself link
    Then I should see the If you are no longer representing yourself page
    Then I should see a Document Download button


