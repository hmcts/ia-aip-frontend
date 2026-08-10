// Case 1001 - Draft appeal (appealStarted)
export const multipleAppealCase1001 = {
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
};

// Case 1002 - Submitted appeal
export const multipleAppealCase1002 = {
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
    'appellantNationalities': [{ 'id': 'nat-1002', 'value': { 'code': 'GB' } }],
    'homeOfficeDecisionDate': '2024-01-01',
    'searchPostcode': 'SW1A 1AA',
    'submissionOutOfTime': 'No',
    'subscriptions': [{
      'id': 'sub-1002',
      'value': { 'email': 'john.smith@example.com', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    }],
    'cmaRequirements': {}
  }
};

// Case 1003 - Awaiting reasons for appeal
export const multipleAppealCase1003 = {
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
    'appellantNationalities': [{ 'id': 'nat-1003', 'value': { 'code': 'GB' } }],
    'homeOfficeDecisionDate': '2023-12-20',
    'searchPostcode': 'SW1A 1AA',
    'submissionOutOfTime': 'No',
    'subscriptions': [{
      'id': 'sub-1003',
      'value': { 'email': 'john.smith@example.com', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    }],
    'directions': [
      {
        'id': '1',
        'value': {
          'tag': 'requestReasonsForAppeal',
          'dateDue': '2024-02-05',
          'parties': 'appellant',
          'dateSent': '2024-01-08',
          'uniqueId': 'dir-1003-1',
          'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
          'directionType': 'requestReasonsForAppeal',
          'previousDates': []
        }
      }
    ],
    'respondentDocuments': [
      {
        'id': '1',
        'value': {
          'tag': 'respondentEvidence',
          'document': {
            'document_url': 'http://dm-store:4506/documents/doc-1003-1',
            'document_filename': 'Evidence_File.png',
            'document_binary_url': 'http://dm-store:4506/documents/doc-1003-1/binary'
          },
          'description': 'Home Office evidence',
          'dateUploaded': '2024-01-07'
        }
      }
    ],
    'cmaRequirements': {}
  }
};
