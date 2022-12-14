const awaitingReasonsForAppealCaseDataES = {
  "total": 1,
  "cases": [
    {
      'id': 4,
      'jurisdiction': 'IA',
      'state': 'awaitingReasonsForAppeal',
      'version': 12,
      'case_type_id': 'Asylum',
      'created_date': '2020-02-07T16:39:39.894',
      'last_modified': '2020-02-11T12:18:39.813',
      'case_data': {
        'appellantHasFixedAddress': 'Yes',
        'subscriptions': [{
          'id': 'ef8cb4ca-9df8-42f5-b326-e78725de99be',
          'value': {'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes'}
        }],
        'appellantDateOfBirth': '1990-01-01',
        'appellantAddress': {
          'County': '',
          'Country': 'United Kingdom',
          'PostCode': 'W1W 7RT',
          'PostTown': 'LONDON',
          'AddressLine1': '60 GREAT PORTLAND STREET',
          'AddressLine2': ''
        },
        'appealType': 'protection',
        'appellantGivenNames': 'Alex',
        'journeyType': 'aip',
        'appellantFamilyName': 'NotHere',
        'appellantNationalities': [{'id': 'deb1b9fe-43f7-4a8b-89ef-951eeda7e11d', 'value': {'code': 'AL'}}],
        'homeOfficeDecisionDate': '2020-02-01',
        'searchPostcode': 'W1W 7RT',
        'submissionOutOfTime': 'No',
        'homeOfficeReferenceNumber': 'A1234567',
        "respondentDocuments": [
          {
            "id": "1",
            "value": {
              "tag": "respondentEvidence",
              "document": {
                "document_url": "http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2",
                "document_filename": "Evidence_File.png",
                "document_binary_url": "http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary"
              },
              "description": "Screenshot of evidence",
              "dateUploaded": "2020-02-21"
            }
          }
        ],
        "makeAnApplications": [
          {
            "id": "1",
            "value": {
              "date": "2021-04-30",
              "type": "Time extension",
              "state": "awaitingReasonsForAppeal",
              "details": "bla blab bla bla bla",
              "decision": "Pending",
              "evidence": [],
              "applicant": "Appellant",
              "applicantRole": "citizen"
            }
          }
        ],
        "directions": [
          {
            "id": "3",
            "value": {
              "tag": "requestReasonsForAppeal",
              "dateDue": "2020-01-01",
              "parties": "appellant",
              "dateSent": "2020-04-30",
              "explanation": "You must now tell us why you think the Home Office decision to refuse your claim is wrong.",
              "previousDates": []
            }
          },
          {
            "id": "2",
            "value": {
              "tag": "respondentEvidence",
              "dateDue": "2022-01-01",
              "parties": "respondent",
              "dateSent": "2020-04-30",
              "explanation": "Send your evidence",
              "previousDates": []
            }
          },
          {
            "id": "1",
            "value": {
              "tag": "respondentEvidence",
              "dateDue": "2020-03-12",
              "parties": "respondent",
              "dateSent": "2020-02-27",
              "explanation": "A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant",
              "previousDates": []
            }
          }
        ]
      }
    }
    ]
};

module.exports = { ...awaitingReasonsForAppealCaseDataES };
