import moment from 'moment';

export default {
  'id': 36,
  'jurisdiction': 'IA',
  'state': 'appealStarted',
  'version': 8,
  'case_type_id': 'Asylum',
  'created_date': '2019-11-13T10:18:43.271',
  'last_modified': '2019-11-13T15:35:31.356',
  'security_classification': 'PUBLIC',
  'case_data': {
    'id': '36',
    'journeyType': 'aip',
    'homeOfficeReferenceNumber': 'A1111111',
    'homeOfficeDecisionDate': moment().format('YYYY-MM-DD'),
    'appellantGivenNames': 'givenName',
    'appellantFamilyName': 'familyName',
    'appellantDateOfBirth': '1981-01-01',
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
    'appellantPhoneNumber': '07899999999',
    'appealType': 'protection',
    'feeCode': 'FEE0238',
    'isAdmin': 'No',
    'feeVersion': '3',
    'hasSponsor': 'No',
    's94bStatus': 'No',
    'feeAmountGbp': '14000',
    'appellantInUk': 'Yes',
    'isNabaEnabled': 'No',
    'paymentStatus': 'Payment pending',
    'staffLocation': 'Newport',
    'feeDescription': 'Appeal determined with a hearing',
    'feeWithHearing': '140',
    'isAriaMigrated': 'No',
    'searchPostcode': 'SW1A 2AA',
    'refundRequested': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'SW1A 2AA',
      'PostTown': 'LONDON',
      'AddressLine1': '10 DOWNING STREET',
      'AddressLine2': ''
    },
    'isNabaAdaEnabled': 'Yes',
    'isNabaEnabledOoc': 'No',
    'hmctsCaseCategory': 'Protection',
    'appealOutOfCountry': 'No',
    'appellantStateless': 'isStateless',
    'paymentDescription': 'Appeal determined with a hearing',
    'feeSupportPersisted': 'No',
    'isFeePaymentEnabled': 'Yes',
    'isRemissionsEnabled': 'Yes',
    'submissionOutOfTime': 'No',
    'appellantInDetention': 'No',
    'feePaymentAppealType': 'Yes',
    'isAriaMigratedFilter': 'No',
    'appealReferenceNumber': 'DRAFT',
    'caseNameHmctsInternal': 'John Smith',
    'hmctsCaseNameInternal': 'John Smith',
    'isOutOfCountryEnabled': 'Yes',
    'appellantNationalities': [
      {
        'id': '1',
        'value': {
          'code': 'ZZ'
        }
      }
    ],
    'caseManagementLocation': {
      'region': '1',
      'baseLocation': '227101'
    },
    'isLateRemissionRequest': 'No',
    'appealGroundsForDisplay': [],
    'deportationOrderOptions': 'No',
    'appellantHasFixedAddress': 'Yes',
    'decisionHearingFeeOption': 'decisionWithHearing',
    'hasServiceRequestAlready': 'No',
    'lateLocalAuthorityLetters': [],
    'recordedOutOfTimeDecision': 'No',
    'refundConfirmationApplied': 'No',
    'isCaseUsingLocationRefData': 'Yes',
    'appealTypePreviousSelection': 'protection',
    'ccdReferenceNumberForDisplay': '1766 0777 2535 9921',
    'paAppealTypeAipPaymentOption': 'payLater',
    'remissionEcEvidenceDocuments': [],
    'sendDirectionActionAvailable': 'No',
    "uploadTheNoticeOfDecisionDocs": [
      {
        "id": "1cdbd50e-3d6b-49e5-b7b1-98efef7ddf8c",
        "value": {
          "tag": "additionalEvidence",
          "document": {
            "document_filename": "test_doc.pdf",
            "document_url": "http://dm-store:4506/documents/b3c88303-5186-4605-881d-bbe4dfd2ee1a",
            "document_binary_url": "http://dm-store:4506/documents/b3c88303-5186-4605-881d-bbe4dfd2ee1a/binary"
          }
        }
      }
    ],
    'appellantInUkPreviousSelection': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'changeDirectionDueDateActionAvailable': 'No',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'markEvidenceAsReviewedActionAvailable': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'markAddendumEvidenceAsReviewedActionAvailable': 'No',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAddendumEvidenceAdminOfficerActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No'
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
