import moment from "moment/moment";

const euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal = {
  'jurisdiction': 'IA',
  'state': 'appealStarted',
  'version': 8,
  'case_type_id': 'Asylum',
  'created_date': '2019-11-13T10:18:43.271',
  'last_modified': '2019-11-13T15:35:31.356',
  'security_classification': 'PUBLIC',
  'case_data': {
    'journeyType': 'aip',
    'id': '31',
    'homeOfficeReferenceNumber': 'A1111111',
    'homeOfficeDecisionDate': moment().format('YYYY-MM-DD'),
    'appellantGivenNames': 'givenName',
    'appellantFamilyName': 'familyName',
    'appellantDateOfBirth': '1981-01-01',
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
    },
    'subscriptions': [{
      'id': 1,
      'value': {
        'subscriber': 'appellant',
        'wantsEmail': 'No',
        'email': null,
        'wantsSms': 'Yes',
        'mobileNumber': '07899999999'
      }
    }],
    'appealType': 'refusalOfHumanRights',
    'feeWithoutHearing': '80',
    'feeCode': 'abc',
    'feeVersion': '2',
    'uploadTheNoticeOfDecisionDocs': []
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

module.exports = { ...euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal };

