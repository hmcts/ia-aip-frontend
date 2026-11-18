export default {
  'id': 71,
  'jurisdiction': 'IA',
  'state': 'appealSubmitted',
  'version': 5,
  'case_type_id': 'Asylum',
  'created_date': '2020-02-12T10:41:51.55',
  'last_modified': '2020-02-12T10:43:14.23',
  'case_data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [{
      'id': 'ce208f30-0aae-41a1-95a6-8b79333fa274',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    }],
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
    'appellantNationalities': [{ 'id': '39dd0f68-aa9f-41b0-99a8-e553e1ce0fb1', 'value': { 'code': 'AX' } }],
    'homeOfficeDecisionDate': '2020-02-10',
    'searchPostcode': 'W1W 7RT',
    'submissionOutOfTime': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'cmaRequirements': {},
    'qmCitizenQueries': {
      'roleOnCase': '',
      'caseMessages': [
        {
          'id': '656685e2-c0f9-48a7-b158-5215dd7cbb1c',
          'value': {
            'id': '1',
            'body': 'Some unresponded query details',
            'name': 'Some appellant',
            'subject': 'Some unresponded query subject',
            'createdBy': '71',
            'createdOn': '2026-11-11T14:54:51.265Z',
            'attachments': [
              {
                'id': '5e742744-9928-4dfc-a3d1-cd28e723ae94',
                'value': {
                  'document_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2',
                  'document_filename': 'Evidence_File.png',
                  'document_binary_url': 'http://dm-store:4506/documents/086bdfd6-b0cc-4405-8332-cf1288f38aa2/binary'
                }
              }
            ],
            'messageType': 'NewQuery'
          }
        },
        {
          'id': 'ab077b67-7ec4-4871-ab5d-e188584ab0c5',
          'value': {
            'id': '2',
            'body': 'Some query that has been closed',
            'name': 'Some appellant',
            'isHearingRelated': 'No',
            'subject': 'Query that has been closed',
            'createdBy': '71',
            'createdOn': '2026-11-11T14:55:40.752Z',
            'attachments': [],
            'messageType': 'NewQuery'
          }
        },
        {
          'id': 'ab077b67-7ec4-4871-ab5d-e188584ab0c5',
          'value': {
            'id': '3',
            'body': 'Reason to close this query',
            'name': 'Some appellant',
            'createdBy': '1234-1234-1234-1234',
            'createdOn': '2026-11-11T14:55:40.752Z',
            'attachments': [],
            'messageType': 'Respond',
            'isClosed': 'Yes',
            'parentId': '2'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '4',
            'body': 'Some query that has been responded to',
            'name': 'Some appellant',
            'subject': 'Query that has been responded to',
            'createdBy': '71',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'hearingDate': '2027-01-01',
            'messageType': 'NewQuery',
            'isHearingRelated': 'Yes'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '5',
            'body': 'Some response to the query',
            'name': 'Some appellant',
            'createdBy': '1234',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'messageType': 'Respond',
            'parentId': '4'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '6',
            'body': 'Some query to follow up to details',
            'name': 'Some appellant',
            'subject': 'Query that has been followed up',
            'createdBy': '71',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'messageType': 'NewQuery',
            'isHearingRelated': 'No'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '7',
            'body': 'Some response to the query',
            'name': 'Some appellant',
            'createdBy': '1234',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'messageType': 'Respond',
            'parentId': '6'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '8',
            'body': 'Some follow up to the response',
            'name': 'Some appellant',
            'createdBy': '71',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'messageType': 'Followup',
            'parentId': '6'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '9',
            'body': 'Some query to request to close',
            'name': 'Some appellant',
            'subject': 'Query that has been requested to close',
            'createdBy': '71',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'messageType': 'NewQuery',
            'isHearingRelated': 'No'
          }
        },
        {
          'id': '08f0d92d-200d-4e35-a8f7-ce2148e58ea0',
          'value': {
            'id': '10',
            'body': 'Request for query closure. Some details of why I want to close this.',
            'name': 'Some appellant',
            'createdBy': '71',
            'createdOn': '2026-11-11T15:10:52.860Z',
            'attachments': [],
            'messageType': 'Followup',
            'parentId': '9'
          }
        }
      ]
    }
  }
};
