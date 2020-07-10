const submittedCmaRequirements = {
  'id': 11,
  'jurisdiction': 'IA',
  'state': 'cmaListed',
  'version': 11,
  'case_type_id': 'Asylum',
  'created_date': '2020-02-12T10:41:51.55',
  'last_modified': '2020-02-12T10:43:14.23',
  'case_data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [ {
      'id': 'ce208f30-0aae-41a1-95a6-8b79333fa274',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'appellantDateOfBirth': '2019-01-01',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'appealType': 'protection',
    'appellantGivenNames': 'Citizen',
    'journeyType': 'aip',
    'appellantFamilyName': 'Surname',
    'appellantNationalities': [ { 'id': '39dd0f68-aa9f-41b0-99a8-e553e1ce0fb1', 'value': { 'code': 'AX' } } ],
    'homeOfficeDecisionDate': '2020-02-10',
    'searchPostcode': 'W1W 7RT',
    'submissionOutOfTime': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'cmaRequirements': {},
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
    "directions": [
      {
        "id": "3",
        "value": {
          "tag": "requestCmaRequirements",
          "dateDue": "2020-06-17",
          "parties": "appellant",
          "dateSent": "2020-06-10",
          "explanation": "You need to attend a case management appointment. This is a meeting with a Tribunal Caseworker to talk about your appeal. A Home Office representative may also be at the meeting.",
          "previousDates": []

        }
      },
      {
        "id": "2",
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
        "id": "1",
        "value": {
          "tag": "respondentEvidence",
          "dateDue": "2020-03-12",
          "parties": "respondent",
          "dateSent": "2020-02-27",
          "explanation": "A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant",
          "previousDates": [],
          "hearing": {
            "hearingCentre": "taylorHouse",
            "time": "90",
            "date": "2020-08-11T10:00:01.000"
          }
        }
      }
    ]
  }
};

module.exports = { ...submittedCmaRequirements };
