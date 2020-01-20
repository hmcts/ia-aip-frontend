
Feature: Appeal service page.
  As a service owner
  I want to enforce eligibility criteria at the start of the journey

Scenario: Starting to answer questions
Given an appellant wants to challenge HO decision
And they find the private beta service
When they answer yes or no to any of the questions in RIA-2408 & RIA-2424
And they are eligible to use the private beta service
Then direct them to screen attached
And CTA takes user to idam account creation
