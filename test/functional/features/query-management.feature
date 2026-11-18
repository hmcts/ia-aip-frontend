@query-management
Feature: Query management

  Scenario: View messages
    Given I have logged in as an appellant with email "appealWithQueries@example.com"
    Then I see "aa asd" in title
    And I see "Send a message" link
    And I see "View messages" link
    And I see "view messages" link
    And I should see the new message banner
    And I check page accessibility

    When I click "View messages" link
    Then I see "View messages" in title
    And I should not see the new message banner
    And I should see the queries table with 5 queries
    And I should see row 1 with values "Some unresponded message subject", "You", "11 November 2026", "You", "11 November 2026", "Awaiting response"
    And I should see row 2 with values "Query that has been closed", "You", "11 November 2026", "Immigration & Asylum Chamber", "11 November 2026", "Closed"
    And I should see row 3 with values "Query that has been responded to", "You", "11 November 2026", "Immigration & Asylum Chamber", "11 November 2026", "Responded"
    And I should see row 4 with values "Query that has been followed up", "You", "11 November 2026", "You", "11 November 2026", "Awaiting response to follow-up"
    And I should see row 5 with values "Query that has been requested to close", "You", "11 November 2026", "You", "11 November 2026", "Awaiting response to closure request"
    And I check page accessibility

    When I click row 1 link
    Then I see "View message" in title
    And I see 1 query card
    And I see query card 1 with title "Your original message", subject "Some unresponded message subject", details "Some unresponded query details", attachments "Evidence_File.png", hearingRelated "No", hearing date "", sent by "You", sent on "11 November 2026"
    And I see the reviewing message text
    And I dont see the responded text
    And I dont see the closed text
    And I see the close query request button
    And I dont see the follow up button
    And I check page accessibility

    When I click the back button
    When I click row 2 link
    Then I see "View message" in title
    And I see 2 query cards
    And I see query card 1 with title "Your original message", subject "Query that has been closed", details "Some query that has been closed", attachments "No documents attached", hearingRelated "", hearing date "", sent by "You", sent on "11 November 2026"
    And I see query card 2 with title "Immigration & Asylum Chamber response", subject "", details "Reason to close this message", attachments "No documents attached", hearingRelated "", hearing date "", sent by "Immigration & Asylum Chamber", sent on "11 November 2026"
    And I dont see the reviewing message text
    And I dont see the responded text
    And I see the closed text
    And I dont see the close query request button
    And I dont see the follow up button
    And I check page accessibility

    When I click the back button
    When I click row 3 link
    Then I see "View message" in title
    And I see 2 query cards
    And I see query card 1 with title "Your original message", subject "Query that has been responded to", details "Some query that has been responded to", attachments "No documents attached", hearingRelated "Yes", hearing date "01 January 2027", sent by "You", sent on "11 November 2026"
    And I see query card 2 with title "Immigration & Asylum Chamber response", subject "", details "Some response to the query", attachments "No documents attached", hearingRelated "", hearing date "", sent by "Immigration & Asylum Chamber", sent on "11 November 2026"
    And I dont see the reviewing message text
    And I see the responded text
    And I dont see the closed text
    And I see the close query request button
    And I see the follow up button
    And I check page accessibility

    When I click the back button
    When I click row 4 link
    Then I see "View message" in title
    And I see 3 query cards
    And I see query card 1 with title "Your original message", subject "Query that has been followed up", details "Some query to follow up to details", attachments "No documents attached", hearingRelated "No", hearing date "", sent by "You", sent on "11 November 2026"
    And I see query card 2 with title "Immigration & Asylum Chamber response", subject "", details "Some response to the query", attachments "No documents attached", hearingRelated "", hearing date "", sent by "Immigration & Asylum Chamber", sent on "11 November 2026"
    And I see query card 3 with title "Your follow-up message", subject "", details "Some follow up to the response", attachments "No documents attached", hearingRelated "", hearing date "", sent by "You", sent on "11 November 2026"
    And I see the reviewing message text
    And I dont see the responded text
    And I dont see the closed text
    And I see the close query request button
    And I dont see the follow up button
    And I check page accessibility

    When I click the back button
    When I click row 5 link
    Then I see "View message" in title
    And I see 2 query cards
    And I see query card 1 with title "Your original message", subject "Query that has been requested to close", details "Some query to request to close", attachments "No documents attached", hearingRelated "No", hearing date "", sent by "You", sent on "11 November 2026"
    And I see query card 2 with title "Your closure request", subject "", details "Request for message closure. Some details of why I want to close this.", attachments "No documents attached", hearingRelated "", hearing date "", sent by "You", sent on "11 November 2026"
    And I see the reviewing message text
    And I dont see the responded text
    And I dont see the closed text
    And I see the close query request button
    And I dont see the follow up button
    And I check page accessibility

  Scenario: Common queries
    Given I have logged in as an appellant with email "appealWithQueries@example.com"
    Then I see "aa asd" in title
    And I see "Send a message" link
    And I see "View messages" link
    And I see "view messages" link
    And I should see the new message banner
    And I check page accessibility

    When I click "Send a message" link
    Then I see "What do you want to do" in title
    And I see 3 common query options
    And I see the ask query option
    When I select option "Example choice 1"
    And I click continue
    Then I see "Some example title 1" in title
    And I see "An example of a p tag in use" as a "p" element
    And I see "example of a list item 1" as a "li" element
    And I see "example of a list item 2" as a "li" element
    And I see "example of a third list item" as a "li" element
    And I see "example of bold p tag" as a "strong" element
    And I see "example of italic p tag" as a "em" element
    And I see "example of a link open in new tab" as a "a" element
    And I see "example of a link open in same tab" as a "a" element
    And I see the anything else section
    And I check page accessibility

    When I click the back button
    When I select option "Example choice 2"
    And I click continue
    Then I see "Some example title 2" in title
    And I see "An example of a p tag in use" as a "p" element
    And I see "some body text for second paragraph" as a "p" element
    And I see the anything else section
    And I check page accessibility

    When I click the back button
    When I select option "A third example choice"
    And I click continue
    Then I see "Some third example title" in title
    And I see "Some body text" as a "p" element
    And I see the anything else section
    And I check page accessibility

  Scenario: Send a message
    Given I have logged in as an appellant with email "appealWithQueries@example.com"
    Then I see "aa asd" in title
    And I see "Send a message" link
    And I see "View messages" link
    And I see "view messages" link
    And I should see the new message banner

    When I click "Send a message" link
    Then I see "What do you want to do" in title
    When I select option "Send a message to the Immigration & Asylum Chamber"
    And I click continue

    Then I see "Message sharing permission" in title
    And I see the message sharing permission page content
    And I check page accessibility

    When I click continue
    Then I should see error "Select the checkbox if you agree that your message can be shared with the other party"
    And I check page accessibility

    When I check the agreement
    And I click continue

    Then I see "Send a message" in title
    And I see the Send a message page content
    And I see 0 files uploaded
    And I check page accessibility

    When I click continue
    Then I should see error "Please enter a message subject"
    Then I should see error "Please enter message details"
    Then I should see error "Please select Yes if this message is related to a hearing"
    And I check page accessibility

    When I enter "Some subject" in the "Message subject" input
    And I enter "Some message details" in the "Message details" textarea
    And I select option "No"
    Then I should not see the date of hearing field
    And I check page accessibility
    And I select option "Yes"
    Then I should see the date of hearing field
    And I check page accessibility
    And I click continue
    Then I should not see error "Please enter a message subject"
    Then I should not see error "Please enter message details"
    Then I should not see error "Please select Yes if this message is related to a hearing"
    Then I should see error "Please enter the date of your hearing"
    And I check page accessibility

    When I enter "10" in the "Day" input
    And I click continue
    Then I should see error "Please enter the date of your hearing"
    And I check page accessibility

    When I enter "10" in the "Month" input
    And I click continue
    Then I should see error "Please enter the date of your hearing"
    And I check page accessibility

    When I enter "2000" in the "Year" input
    And I click continue
    Then I should not see error "Please enter the date of your hearing"
    Then I should see error "Your hearing date must be in the future"
    And I check page accessibility

    When I enter "3000" in the "Year" input
    And I click the "Upload" button
    Then I should not see error "Please enter the date of your hearing"
    Then I should not see error "Your hearing date must be in the future"
    Then I should see error "Select a file"
    And I check page accessibility

    When I upload a document too large
    Then I should see error "The selected file must be smaller than 0.001MB"
    And I check page accessibility

    When I upload a document invalid format
    Then I should see error "The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv"
    And I check page accessibility

    When I upload a valid document
    Then I see 1 files uploaded

    When I upload a valid image document
    Then I see 2 files uploaded
    And I check page accessibility

    When I click continue
    Then I see "Check your answers" in title
    And I see "Some subject" for CYA row "Message subject" and change link present
    And I see "Some message details" for CYA row "Message details" and change link present
    And I see "Yes" for CYA row "Is this message related to a hearing?" and change link present
    And I see "10 October 3000" for CYA row "Date of hearing" and change link present
    And I see "valid-pdf-file.pdf [] valid-image-file.png" for CYA row "Supporting documents" and change link present
    And I check page accessibility

    When I click "Change" link
    Then I see "Send a message" in title

    And I delete document 1
    And I wait for 1 second
    When I select option "No"
    And I check page accessibility
    And I click continue
    Then I see "Check your answers" in title
    And I see "Some subject" for CYA row "Message subject" and change link present
    And I see "Some message details" for CYA row "Message details" and change link present
    And I see "No" for CYA row "Is this message related to a hearing?" and change link present
    And I dont see CYA row "Date of hearing"
    And I see "valid-image-file.png" for CYA row "Supporting documents" and change link present
    And I check page accessibility

    When I click "Confirm and send" button
    Then I should see the Sent message confirmation page
    And I check page accessibility

  Scenario: Follow up message
    Given I have logged in as an appellant with email "appealWithQueries@example.com"
    Then I see "aa asd" in title
    And I see "View messages" link

    When I click "view messages" link
    Then I see "View messages" in title
    And I should see the queries table with 5 queries

    When I click row 3 link
    Then I see "View message" in title
    And I see the follow up button
    When I click the "Send a follow-up message" button
    Then I see "Message sharing permission" in title
    And I see the message sharing permission page content
    And I check page accessibility

    When I click continue
    Then I should see error "Select the checkbox if you agree that your message can be shared with the other party"
    And I check page accessibility

    When I check the agreement
    And I click continue

    Then I see "Follow-up message" in title
    And I see the Follow-up message page content
    And I see 0 files uploaded
    And I check page accessibility

    When I click continue
    Then I should see error "Please enter message details"
    And I check page accessibility

    And I enter "Some message details" in the "Message details" textarea
    And I click the "Upload" button
    Then I should not see error "Please enter message details"
    Then I should see error "Select a file"
    And I check page accessibility

    When I upload a document too large
    Then I should see error "The selected file must be smaller than 0.001MB"
    And I check page accessibility

    When I upload a document invalid format
    Then I should see error "The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv"
    And I check page accessibility

    When I upload a valid document
    Then I see 1 files uploaded
    And I check page accessibility

    When I click continue
    Then I see "Check your answers" in title
    And I see "Some message details" for CYA row "Message details" and change link present
    And I see "valid-pdf-file.pdf" for CYA row "Supporting documents" and change link present
    And I check page accessibility

    When I click "Change" link
    Then I see "Follow-up message" in title
    And I check page accessibility

    And I delete document 1
    And I wait for 1 second
    And I click continue
    Then I see "Check your answers" in title
    And I see "Some message details" for CYA row "Message details" and change link present
    And I dont see CYA row "Supporting documents"
    And I check page accessibility

    When I click "Confirm and send" button
    Then I should see the Sent message confirmation page
    And I check page accessibility

  Scenario: Request to close a query
    Given I have logged in as an appellant with email "appealWithQueries@example.com"
    Then I see "aa asd" in title
    And I see "View messages" link

    When I click "view messages" link
    Then I see "View messages" in title
    And I should see the queries table with 5 queries

    When I click row 1 link
    Then I see "View message" in title
    And I see the close query request button
    When I click the "Request to close this message" button

    Then I see "Request closure of message" in title
    And I see the Close query request page content
    And I see 0 files uploaded
    And I check page accessibility

    When I click continue
    Then I should see error "Please enter message details"
    And I check page accessibility

    And I enter "Some message details" in the "Why are you requesting closure of this message?" textarea
    And I click the "Upload" button
    Then I should not see error "Please enter message details"
    Then I should see error "Select a file"
    And I check page accessibility

    When I upload a document too large
    Then I should see error "The selected file must be smaller than 0.001MB"
    And I check page accessibility

    When I upload a document invalid format
    Then I should see error "The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv"
    And I check page accessibility

    When I upload a valid document
    Then I see 1 files uploaded
    And I check page accessibility

    When I click continue
    Then I see "Check your answers" in title
    And I see "Some message details" for CYA row "Message details" and change link present
    And I see "valid-pdf-file.pdf" for CYA row "Supporting documents" and change link present
    And I check page accessibility

    When I click "Change" link
    Then I see "Request closure of message" in title
    And I check page accessibility

    And I delete document 1
    And I wait for 1 second
    And I click continue
    Then I see "Check your answers" in title
    And I see "Some message details" for CYA row "Message details" and change link present
    And I dont see CYA row "Supporting documents"
    And I check page accessibility

    When I click "Confirm and send" button
    Then I should see the Sent message confirmation page
    And I check page accessibility
