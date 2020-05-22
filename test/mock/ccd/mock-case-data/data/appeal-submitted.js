const appealSubmittedCaseData = {
  'id': 3,
  'jurisdiction': 'IA',
  'state': 'appealSubmitted',
  'version': 9,
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
    'appellantGivenNames': 'aa',
    'journeyType': 'aip',
    'appellantFamilyName': 'asd',
    'appellantNationalities': [ { 'id': '39dd0f68-aa9f-41b0-99a8-e553e1ce0fb1', 'value': { 'code': 'AX' } } ],
    'homeOfficeDecisionDate': '2020-02-10',
    'searchPostcode': 'W1W 7RT',
    'submissionOutOfTime': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'history': [ {
      "id": "submitAppeal",
      "event": {
        "eventName": "Submit your appeal",
        "description": "Submit appeal case AIP"
      },
      "user": {
        "id": "52b180a5-deaf-4bc3-b586-562b9f2e86f6",
        "lastName": "Citizen",
        "firstName": "Alex"
      },
      "createdDate": "2020-02-26T12:45:29.309",
      "caseTypeVersion": 1,
      "state": {
        "id": "appealSubmitted",
        "name": "Appeal submitted"
      },
      "data": {}
    } ]
  }
};

module.exports = { ...appealSubmittedCaseData };
