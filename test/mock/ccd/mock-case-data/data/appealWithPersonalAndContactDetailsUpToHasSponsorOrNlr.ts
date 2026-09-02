import moment from 'moment/moment';

export default {
  'id': 52,
  'jurisdiction': 'IA',
  'state': 'appealStarted',
  'version': 5,
  'case_type_id': 'Asylum',
  'created_date': '2020-02-12T10:41:51.55',
  'last_modified': '2020-02-12T10:43:14.23',
  'case_data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [{
      'id': 'ce208f30-0aae-41a1-95a6-8b79333fa274',
      'value': { 'email': 'citizen@test.com', 'wantsSms': 'Yes', 'mobileNumber': '07899999999', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    }],
    'uploadTheNoticeOfDecisionDocs': [
      {
        'id': 'bbbadb17-9e51-4237-85b4-9d32290e932b',
        'value': {
          'document': {
            'document_url': 'http://dm-store:4506/documents/29b4eba7-c969-4cd8-a1a9-cfb4c9b4aa7e',
            'document_filename': 'aip setup guide 2.txt',
            'document_binary_url': 'http://dm-store:4506/documents/29b4eba7-c969-4cd8-a1a9-cfb4c9b4aa7e/binary'
          }
        }
      }
    ],
    'appellantDateOfBirth': '2019-01-01',
    'appealType': 'protection',
    'journeyType': 'aip',
    'searchPostcode': 'W1W 7RT',
    'submissionOutOfTime': 'No',
    'homeOfficeReferenceNumber': '1234-1234-1234-1234',
    'id': '26',
    'appellantInUk': 'Yes',
    'homeOfficeDecisionDate': moment().format('YYYY-MM-DD'),
    'appellantGivenNames': 'givenName',
    'appellantFamilyName': 'familyName',
    'appellantNationalities': [
      {
        'id': '1',
        'value': {
          'code': 'FI'
        }
      }
    ],
    'appellantAddress': {
      'AddressLine1': 'Address line 1',
      'PostTown': 'Town',
      'PostCode': 'CM15 9BN'
    }
  }
};
