import * as _ from "lodash";
import moment from "moment/moment";

const appealWithHomeOfficeReference = {
  'jurisdiction': 'IA',
  'state': 'appealStarted',
  'version': 8,
  'case_type_id': 'Asylum',
  'created_date': '2019-11-13T10:18:43.271',
  'last_modified': '2019-11-13T15:35:31.356',
  'security_classification': 'PUBLIC',
  'case_data': {
    'journeyType': 'aip'
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

function setupData(newCaseData) {
  const caseDataClone = _.cloneDeep(appealWithHomeOfficeReference);
  return _.merge(caseDataClone.case_data, newCaseData);
}

const appealWithHomeOfficeReference = setupData({ id: '21', homeOfficeReferenceNumber: 'A1111111' })

const appealWithHomeOfficeDetails = setupData({
  id: '22',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD')
});

const appealWithHomeOfficeDetailsAndName = setupData({
  id: '23',
  appealType: 'protection',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName'
});

const appealWithHomeOfficeDetailsNameAndDateOfBirth = setupData({
  id: '24',
  appealType: 'protection',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01'
});

const appealWithHomeOfficeDetailsNameDateOfBirthAndNationality = setupData({
  id: '25',
  appealType: 'protection',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01',
  appellantNationalities: [
    {
      id: '1',
      value: {
        code: 'FI'
      }
    }
  ]
});

const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress = setupData({
  id: '26',
  appealType: 'protection',
  appellantInUk: 'Yes',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01',
  appellantNationalities: [
    {
      id: '1',
      value: {
        code: 'FI'
      }
    }
  ],
  appellantAddress: {
    AddressLine1: 'Address line 1',
    PostTown: 'Town',
    PostCode: 'CM15 9BN'
  }
});

const outOfTimeAppealWithReasonForBeingLateAnEvidence = setupData({
  id: '28',
  appealType: 'protection',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().subtract(20, 'days').format('YYYY-MM-DD'),
  submissionOutOfTime: 'Yes',
  applicationOutOfTimeExplanation: 'The reason why the appeal is late',
  applicationOutOfTimeDocument: {
    document_filename: '1581607687239-fake.png',
    document_url: 'http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909'
  },
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01',
  appellantNationalities: [
    {
      id: '1',
      value: {
        code: 'FI'
      }
    }
  ],
  appellantAddress: {
    AddressLine1: 'Address line 1',
    PostTown: 'Town',
    PostCode: 'CM15 9BN'
  },
  subscriptions: [{
    id: 1,
    value: {
      subscriber: 'appellant',
      wantsEmail: 'No',
      email: null,
      wantsSms: 'Yes',
      mobileNumber: '07899999999'
    }
  }],
  uploadTheNoticeOfDecisionDocs: []
});

const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal = setupData({
  id: '29',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01',
  appellantNationalities: [
    {
      id: '1',
      value: {
        code: 'FI'
      }
    }
  ],
  appellantAddress: {
    AddressLine1: 'Address line 1',
    PostTown: 'Town',
    PostCode: 'CM15 9BN'
  },
  subscriptions: [{
    id: 1,
    value: {
      subscriber: 'appellant',
      wantsEmail: 'No',
      email: null,
      wantsSms: 'Yes',
      mobileNumber: '07899999999'
    }
  }],
  appealType: 'protection',
  uploadTheNoticeOfDecisionDocs: []
});

const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal = setupData({
  id: '30',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01',
  subscriptions: [{
    id: 1,
    value: {
      subscriber: 'appellant',
      wantsEmail: 'No',
      email: null,
      wantsSms: 'Yes',
      mobileNumber: '07899999999'
    }
  }],
  appealType: 'protection',
  uploadTheNoticeOfDecisionDocs: []
});

const euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal = setupData({
  id: '31',
  homeOfficeReferenceNumber: 'A1111111',
  homeOfficeDecisionDate: moment().format('YYYY-MM-DD'),
  appellantGivenNames: 'givenName',
  appellantFamilyName: 'familyName',
  appellantDateOfBirth: '1981-01-01',
  appellantNationalities: [
    {
      id: '1',
      value: {
        code: 'FI'
      }
    }
  ],
  appellantAddress: {
    AddressLine1: 'Address line 1',
    PostTown: 'Town',
    PostCode: 'CM15 9BN'
  },
  subscriptions: [{
    id: 1,
    value: {
      subscriber: 'appellant',
      wantsEmail: 'No',
      email: null,
      wantsSms: 'Yes',
      mobileNumber: '07899999999'
    }
  }],
  appealType: 'refusalOfHumanRights',
  feeWithoutHearing: '80',
  feeCode: 'abc',
  feeVersion: '2',
  uploadTheNoticeOfDecisionDocs: []
});

const appealWithHomeOfficeReferenceES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeReference
  ]
}

const appealWithHomeOfficeDetailsES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetails
  ]
}

const appealWithHomeOfficeDetailsAndNameES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetailsAndName
  ]
}

const appealWithHomeOfficeDetailsNameAndDateOfBirthES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetailsNameAndDateOfBirth
  ]
}

const appealWithHomeOfficeDetailsNameDateOfBirthAndNationalityES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetailsNameDateOfBirthAndNationality
  ]
}

const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddressES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddress
  ]
}

const outOfTimeAppealWithReasonForBeingLateAnEvidenceES = {
  "total": 1,
  "cases": [
    outOfTimeAppealWithReasonForBeingLateAnEvidence
  ]
}

const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal
  ]
}

const appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppealES = {
  "total": 1,
  "cases": [
    appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppeal
  ]
}

const euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES = {
  "total": 1,
  "cases": [
    euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppeal
  ]
}

module.exports = {
  appealWithHomeOfficeReferenceES,
  appealWithHomeOfficeDetailsES,
  appealWithHomeOfficeDetailsAndNameES,
  appealWithHomeOfficeDetailsNameAndDateOfBirthES,
  appealWithHomeOfficeDetailsNameDateOfBirthAndNationalityES,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndAddressES,
  outOfTimeAppealWithReasonForBeingLateAnEvidenceES,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES,
  appealWithHomeOfficeDetailsNameDateOfBirthNationalityAndReasonForAppealES,
  euOrEUSSOrHUAppealWithHomeOfficeDetailsNameDateOfBirthNationalityAddressAndReasonForAppealES
};

