const moment = require('moment');

const appealWithHomeOfficeDetailsAndNameES = {
  "total": 1,
  "cases": [
    {
      'id': 23,
      'jurisdiction': 'IA',
      'state': 'appealStarted',
      'version': 8,
      'case_type_id': 'Asylum',
      'created_date': '2019-11-13T10:18:43.271',
      'last_modified': '2019-11-13T15:35:31.356',
      'security_classification': 'PUBLIC',
      'case_data': {
        'journeyType': 'aip',
        'id': '23',
        'appealType': 'protection',
        'homeOfficeReferenceNumber': 'A1111111',
        'homeOfficeDecisionDate': moment().format('YYYY-MM-DD'),
        'appellantGivenNames': 'givenName',
        'appellantFamilyName': 'familyName'
      },
      'data_classification': {
        'journeyType': 'PUBLIC',
        'homeOfficeReferenceNumber': 'PUBLIC'
      },
      'after_submit_callback_response': null,
      'callback_response_status_code': null,
      'callback_response_status': null,
      'delete_draft_response_status_code': null,
      'delete_draft_response_status': null,
      'security_classifications': {
        'journeyType': 'PUBLIC',
        'homeOfficeReferenceNumber': 'PUBLIC'
      }
    }
  ]
}

module.exports = { ...appealWithHomeOfficeDetailsAndNameES };

