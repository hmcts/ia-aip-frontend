const awaitingReasonsForAppealCaseData = {
  'ids': 1573640323267110,
  'jurisdiction': 'IA',
  'state': 'awaitingReasonsForAppeal',
  'version': 12,
  'case_type_id': 'Asylum',
  'created_date': '2020-02-07T16:39:39.894',
  'last_modified': '2020-02-11T12:18:39.813',
  'case_data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [ {
      'id': 'ef8cb4ca-9df8-42f5-b326-e78725de99be',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
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
    'appellantNationalities': [ { 'id': 'deb1b9fe-43f7-4a8b-89ef-951eeda7e11d', 'value': { 'code': 'AL' } } ],
    'homeOfficeDecisionDate': '2020-02-01',
    'searchPostcode': 'W1W 7RT',
    'submissionOutOfTime': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
};

module.exports = {
  awaitingReasonsForAppealCaseData
};
