const moment = require('moment');

const appealWithHomeOfficeDetailsNameAndDateOfBirth = {
  'jurisdiction': 'IA',
  'state': 'appealStarted',
  'version': 8,
  'case_type_id': 'Asylum',
  'created_date': '2019-11-13T10:18:43.271',
  'last_modified': '2019-11-13T15:35:31.356',
  'security_classification': 'PUBLIC',
  'case_data': {
    'journeyType': 'aip',
    'id': '24',
    'appealType': 'protection',
    'homeOfficeReferenceNumber': 'A1111111',
    'homeOfficeDecisionDate': moment().format('YYYY-MM-DD'),
    'appellantGivenNames': 'givenName',
    'appellantFamilyName': 'familyName',
    'appellantDateOfBirth': '1981-01-01'
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
};

module.exports = { ...appealWithHomeOfficeDetailsNameAndDateOfBirth };

