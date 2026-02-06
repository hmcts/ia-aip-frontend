export default {
  'total': 3,
  'cases': [
    {
      'id': 1001,
      'jurisdiction': 'IA',
      'state': 'appealStarted',
      'version': 2,
      'case_type_id': 'Asylum',
      'created_date': '2024-01-15T10:00:00.000',
      'last_modified': '2024-01-15T10:30:00.000',
      'case_data': {
        'journeyType': 'aip',
        'homeOfficeReferenceNumber': 'A1111111',
        'appealReferenceNumber': 'DRAFT',
        'appellantGivenNames': 'John',
        'appellantFamilyName': 'Smith'
      }
    },
    {
      'id': 1002,
      'jurisdiction': 'IA',
      'state': 'appealSubmitted',
      'version': 5,
      'case_type_id': 'Asylum',
      'created_date': '2024-01-10T09:00:00.000',
      'last_modified': '2024-01-12T14:00:00.000',
      'case_data': {
        'journeyType': 'aip',
        'homeOfficeReferenceNumber': 'A2222222',
        'appealReferenceNumber': 'PA/50100/2024',
        'appellantGivenNames': 'John',
        'appellantFamilyName': 'Smith',
        'appealType': 'protection',
        'appellantDateOfBirth': '1990-05-15',
        'appellantHasFixedAddress': 'Yes',
        'appellantAddress': {
          'County': '',
          'Country': 'United Kingdom',
          'PostCode': 'SW1A 1AA',
          'PostTown': 'LONDON',
          'AddressLine1': '10 Downing Street',
          'AddressLine2': ''
        },
        'subscriptions': [{
          'id': 'sub-1002',
          'value': { 'email': 'john.smith@example.com', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
        }]
      }
    },
    {
      'id': 1003,
      'jurisdiction': 'IA',
      'state': 'awaitingReasonsForAppeal',
      'version': 8,
      'case_type_id': 'Asylum',
      'created_date': '2024-01-05T11:00:00.000',
      'last_modified': '2024-01-08T16:00:00.000',
      'case_data': {
        'journeyType': 'aip',
        'homeOfficeReferenceNumber': 'A3333333',
        'appealReferenceNumber': 'HU/50200/2024',
        'appellantGivenNames': 'John',
        'appellantFamilyName': 'Smith',
        'appealType': 'refusalOfHumanRights',
        'appellantDateOfBirth': '1990-05-15',
        'appellantHasFixedAddress': 'Yes',
        'appellantAddress': {
          'County': '',
          'Country': 'United Kingdom',
          'PostCode': 'SW1A 1AA',
          'PostTown': 'LONDON',
          'AddressLine1': '10 Downing Street',
          'AddressLine2': ''
        },
        'subscriptions': [{
          'id': 'sub-1003',
          'value': { 'email': 'john.smith@example.com', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
        }]
      }
    }
  ]
};
