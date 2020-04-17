export const expectedEventsWithTimeExtensionsData = [ {
  'id': 'reviewTimeExtension',
  'event': { 'eventName': 'Review time extension', 'description': '' },
  'user': { 'id': 'c6181c91-acd0-40cf-aeab-ddf1ff9e39ae', 'lastName': 'Officer', 'firstName': 'Case' },
  'createdDate': '2020-04-15T13:33:20.945',
  'caseTypeVersion': 2,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': 'b47bb4ae-5d6b-452c-974e-1f099ca6c3a8',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'reviewTimeExtensionDecision': 'granted',
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'reviewTimeExtensionParty': 'appellant',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDecisionReason': 'I have granted your request you know have more time',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDate': '2020-04-15',
    'timeExtensions': [ {
      'id': '85795256-3f3c-44b2-8f27-177a98106e48',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'refused',
        'evidence': [ {
          'id': '43564a29-2067-4138-99a9-1e2ddc0ee785',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ],
        'requestedDate': '2020-04-14'
      }
    }, {
      'id': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need more time while I am waiting for a letter',
        'status': 'granted',
        'decision': 'granted',
        'requestedDate': '2020-04-15',
        'decisionReason': 'I have granted your request you know have more time'
      }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '0094baea-66e8-45e2-9d68-5f861e93075a', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionRequired': 'No',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT',
    'reviewTimeExtensionReason': 'I need more time while I am waiting for a letter'
  }
}, {
  'id': 'submitTimeExtension',
  'event': { 'eventName': 'Request time extension', 'description': 'Submit time extension AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-15T13:30:16.831',
  'caseTypeVersion': 2,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': 'b47bb4ae-5d6b-452c-974e-1f099ca6c3a8',
      'value': {
        'email': 'alejandro@example.net',
        'wantsSms': 'No',
        'subscriber': 'appellant',
        'wantsEmail': 'Yes',
        'mobileNumber': null
      }
    } ],
    'reviewTimeExtensionDecision': 'refused',
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'reviewTimeExtensionParty': 'appellant',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDecisionReason': 'Not enough information',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDate': '2020-04-14',
    'timeExtensions': [ {
      'id': '85795256-3f3c-44b2-8f27-177a98106e48',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'refused',
        'evidence': [ {
          'id': '43564a29-2067-4138-99a9-1e2ddc0ee785',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ],
        'requestedDate': '2020-04-14'
      }
    }, {
      'id': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need more time Request 2',
        'status': 'submitted',
        'requestedDate': '2020-04-15'
      }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '0094baea-66e8-45e2-9d68-5f861e93075a', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionRequired': 'Yes',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT',
    'reviewTimeExtensionReason': 'I need an extra 2 weeks'
  }
}, {
  'id': 'editTimeExtension',
  'event': { 'eventName': 'Edit time extension', 'description': 'Edit time extension AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-15T13:30:07.625',
  'caseTypeVersion': 2,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': '9585d1ab-aff5-4906-9e98-d0081676eca6',
      'value': {
        'email': 'alejandro@example.net',
        'wantsSms': 'No',
        'subscriber': 'appellant',
        'wantsEmail': 'Yes',
        'mobileNumber': null
      }
    } ],
    'reviewTimeExtensionDecision': 'refused',
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'reviewTimeExtensionParty': 'appellant',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDecisionReason': 'Not enough information',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDate': '2020-04-14',
    'timeExtensions': [ {
      'id': '9d0b2b9c-1e06-4900-9f4c-0650c70116d6',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'refused',
        'evidence': [ {
          'id': '95fe275e-4641-4612-bee1-dea176a1fb47',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ],
        'requestedDate': '2020-04-14'
      }
    }, {
      'id': 'a5597615-6758-44ff-a501-684fac217860',
      'value': { 'state': 'awaitingReasonsForAppeal', 'reason': 'I need more time Request 2', 'status': 'inProgress' }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '2a34bfc3-469a-4344-b70a-bd807e61ba55', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionRequired': 'No',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT',
    'reviewTimeExtensionReason': 'I need an extra 2 weeks'
  }
}, {
  'id': 'reviewTimeExtension',
  'event': { 'eventName': 'Review time extension', 'description': '' },
  'user': { 'id': 'c6181c91-acd0-40cf-aeab-ddf1ff9e39ae', 'lastName': 'Officer', 'firstName': 'Case' },
  'createdDate': '2020-04-14T15:14:00.647',
  'caseTypeVersion': 1,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': 'f561fe3c-94b3-4ad6-b3ff-c11a35abd4f2',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'reviewTimeExtensionDecision': 'refused',
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'reviewTimeExtensionParty': 'appellant',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDecisionReason': 'Not enough information',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionDate': '2020-04-14',
    'timeExtensions': [ {
      'id': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'refused',
        'decision': 'refused',
        'evidence': [ {
          'id': '0fe958e9-ba00-40bb-8237-234c6f0384b4',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ],
        'requestedDate': '2020-04-14',
        'decisionReason': 'Not enough information'
      }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '076a2495-6660-4d61-aa34-ba243d82d286', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionRequired': 'No',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT',
    'reviewTimeExtensionReason': 'I need an extra 2 weeks'
  }
}, {
  'id': 'submitTimeExtension',
  'event': { 'eventName': 'Request time extension', 'description': 'Submit time extension AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:57:11.293',
  'caseTypeVersion': 1,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': 'f561fe3c-94b3-4ad6-b3ff-c11a35abd4f2',
      'value': {
        'email': 'alejandro@example.net',
        'wantsSms': 'No',
        'subscriber': 'appellant',
        'wantsEmail': 'Yes',
        'mobileNumber': null
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'timeExtensions': [ {
      'id': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'submitted',
        'evidence': [ {
          'id': '0fe958e9-ba00-40bb-8237-234c6f0384b4',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ],
        'requestedDate': '2020-04-14'
      }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '076a2495-6660-4d61-aa34-ba243d82d286', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'reviewTimeExtensionRequired': 'Yes',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT'
  }
}, {
  'id': 'editTimeExtension',
  'event': { 'eventName': 'Edit time extension', 'description': 'Edit time extension AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:57:08.12',
  'caseTypeVersion': 1,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': 'eff2b7e6-4cd0-486e-8483-089e46700c57',
      'value': {
        'email': 'alejandro@example.net',
        'wantsSms': 'No',
        'subscriber': 'appellant',
        'wantsEmail': 'Yes',
        'mobileNumber': null
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'timeExtensions': [ {
      'id': '8d152d33-0d26-482e-9146-049a1021f637',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'inProgress',
        'evidence': [ {
          'id': '01eb888e-0b14-4ae0-8f8f-8a15f4a3ac6b',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ]
      }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': 'eb77a3cb-24b1-4c63-a5cf-b2414f510243', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT'
  }
}, {
  'id': 'editTimeExtension',
  'event': { 'eventName': 'Edit time extension', 'description': 'Edit time extension AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:57:05.94',
  'caseTypeVersion': 1,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': 'd84a09d7-e605-4a91-8f7d-160db21383ce',
      'value': {
        'email': 'alejandro@example.net',
        'wantsSms': 'No',
        'subscriber': 'appellant',
        'wantsEmail': 'Yes',
        'mobileNumber': null
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'timeExtensions': [ {
      'id': '61be5b69-f406-4656-99ba-a8df4f72c679',
      'value': {
        'state': 'awaitingReasonsForAppeal',
        'reason': 'I need an extra 2 weeks',
        'status': 'inProgress',
        'evidence': [ {
          'id': 'c65db14b-61fa-47cd-98ed-02d7d446d52a',
          'value': {
            'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
            'document_filename': 'supporting evidence.jpg',
            'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
          }
        } ]
      }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '06e73d61-6075-4f1e-9085-2fcf28d15525', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT'
  }
}, {
  'id': 'editTimeExtension',
  'event': { 'eventName': 'Edit time extension', 'description': 'Edit time extension AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:56:36.58',
  'caseTypeVersion': 1,
  'state': { 'id': 'awaitingReasonsForAppeal', 'name': 'Awaiting reasons for appeal' },
  'data': {
    'subscriptions': [ {
      'id': '9bd0fcc7-ce73-4b20-ba99-80553ed026b7',
      'value': {
        'email': 'alejandro@example.net',
        'wantsSms': 'No',
        'subscriber': 'appellant',
        'wantsEmail': 'Yes',
        'mobileNumber': null
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeAll': 'awaitingReasonsForAppeal',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'uploadHomeOfficeBundleAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficePou': 'awaitingReasonsForAppeal',
    'directions': [ {
      'id': '2',
      'value': {
        'tag': 'requestReasonsForAppeal',
        'dateDue': '2020-05-12',
        'parties': 'appellant',
        'dateSent': '2020-04-14',
        'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
        'previousDates': []
      }
    }, {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'dateDue': '2020-04-28',
        'parties': 'respondent',
        'dateSent': '2020-04-14',
        'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
        'previousDates': []
      }
    } ],
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'awaitingReasonsForAppeal',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'uploadedHomeOfficeBundleDocs': '- None',
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'awaitingReasonsForAppeal',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
    'timeExtensions': [ {
      'id': '98bfcb40-95bd-474e-bce6-c8623b2e0efb',
      'value': { 'state': 'awaitingReasonsForAppeal', 'reason': 'I need an extra 2 weeks', 'status': 'inProgress' }
    } ],
    'appealReferenceNumber': 'PA/50002/2020',
    'appealType': 'protection',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': 'a09a6159-7d42-4861-baa3-126335327e99', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'respondentDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'respondentEvidence',
        'document': {
          'document_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46',
          'document_filename': 'h0-bundle.jpg',
          'document_binary_url': 'http://dm-store:4506/documents/1cb469f8-a8e0-4906-a48b-ebb13b88ec46/binary'
        },
        'description': 'Ho proof',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToJudge': 'awaitingReasonsForAppeal',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToCaseOfficer': 'awaitingReasonsForAppeal',
    'currentCaseStateVisibleToHomeOfficeApc': 'awaitingReasonsForAppeal',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, {
      'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
      'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
      'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
    }, {
      'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
      'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
    }, {
      'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
      'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
    }, {
      'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
      'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
    } ],
    'searchPostcode': 'W1W 7RT'
  }
}, {
  'id': 'submitAppeal',
  'event': { 'eventName': 'Submit your appeal', 'description': 'Submit appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:53:26.099',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealSubmitted', 'name': 'Appeal submitted' },
  'data': {
    'appellantHasFixedAddress': 'Yes',
    'legalRepName': '',
    'subscriptions': [ {
      'id': 'ddf23871-6ac2-452c-a92e-fe9e3ed13a3f',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'legalRepCompany': '',
    'currentCaseStateVisibleToLegalRepresentative': 'appealSubmitted',
    'appealGroundsForDisplay': [],
    'legalRepresentativeName': 'Pedro Romero',
    'legalRepresentativeEmailAddress': 'email@example.com',
    'currentCaseStateVisibleToHomeOfficeAll': 'appealSubmitted',
    'appealSubmissionDate': '2020-04-14',
    'legalRepresentativeDocuments': [ {
      'id': '1',
      'value': {
        'tag': 'appealSubmission',
        'document': {
          'document_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee',
          'document_filename': 'PA 50002 2020-Romero-appeal-form.PDF',
          'document_binary_url': 'http://dm-store:4506/documents/44da61ab-34c6-4033-b63a-c01fd5abfaee/binary'
        },
        'description': '',
        'dateUploaded': '2020-04-14'
      }
    } ],
    'currentCaseStateVisibleToHomeOfficeLart': 'appealSubmitted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'PA/50002/2020',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appealType': 'protection',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'hearingCentre': 'taylorHouse',
    'applicationChangeDesignatedHearingCentre': 'taylorHouse',
    'appellantNationalities': [ { 'id': '8ec99e7e-eda0-4421-95f6-c7a46ba697a9', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealSubmitted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealSubmitted',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToHomeOfficePou': 'appealSubmitted',
    'currentCaseStateVisibleToCaseOfficer': 'appealSubmitted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealSubmitted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealSubmitted',
    'appellantNameForDisplay': 'Pedro Romero',
    'notificationsSent': [ {
      'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
      'value': '6aa61765-589e-4697-b802-6096b3a9904a'
    }, { 'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER', 'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a' } ],
    'searchPostcode': 'W1W 7RT',
    'sendDirectionActionAvailable': 'Yes',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:52:58.975',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [ {
      'id': '539ef493-d746-413c-ae56-356868158eaf',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appealType': 'protection',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '362232fe-b4e5-460e-b14d-b67ffd0ae620', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'applicationOutOfTimeDocument': {
      'document_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955',
      'document_filename': 'late-reason.jpg',
      'document_binary_url': 'http://dm-store:4506/documents/aa84d94c-1328-4011-ab17-2ea4d55a6955/binary'
    },
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'applicationOutOfTimeExplanation': 'the appeal is  late because I lost my letter',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'searchPostcode': 'W1W 7RT',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:52:23.647',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [ {
      'id': 'e75e78b6-4fdd-4d36-a0eb-6e70af78fbcb',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appealType': 'protection',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '958193a2-1170-49a7-b86d-31ca1156acd7', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'searchPostcode': 'W1W 7RT',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:52:15.844',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'appellantHasFixedAddress': 'Yes',
    'subscriptions': [ {
      'id': '1e1b7b83-6a0f-4243-b519-9a181c790ce4',
      'value': { 'email': 'alejandro@example.net', 'wantsSms': 'No', 'subscriber': 'appellant', 'wantsEmail': 'Yes' }
    } ],
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '739565a5-80e1-4a34-8f89-71794a4b9d5f', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'searchPostcode': 'W1W 7RT',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:52:09.688',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'appellantHasFixedAddress': 'Yes',
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'appellantAddress': {
      'County': '',
      'Country': 'United Kingdom',
      'PostCode': 'W1W 7RT',
      'PostTown': 'LONDON',
      'AddressLine1': '60 GREAT PORTLAND STREET',
      'AddressLine2': ''
    },
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '6673cda5-c91e-436f-b5b6-eb3fa0f20db9', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'searchPostcode': 'W1W 7RT',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:52:01.358',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'appellantNationalities': [ { 'id': '0a317e85-7a8a-4cf0-b795-1d93e2229269', 'value': { 'code': 'DZ' } } ],
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:51:57.271',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'appellantDateOfBirth': '1990-01-01',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:51:50.466',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'appellantGivenNames': 'Pedro',
    'appellantFamilyName': 'Romero',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'homeOfficeDecisionDate': '2020-01-21',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'currentCaseStateVisibleToJudge': 'appealStarted',
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'journeyType': 'aip',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'sendDirectionActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:51:41.688',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'journeyType': 'aip',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'homeOfficeDecisionDate': '2020-01-21',
    'sendDirectionActionAvailable': 'No',
    'changeDirectionDueDateActionAvailable': 'No',
    'submissionOutOfTime': 'Yes',
    'homeOfficeReferenceNumber': 'A1234567',
    'currentCaseStateVisibleToJudge': 'appealStarted'
  }
}, {
  'id': 'editAppeal',
  'event': { 'eventName': 'Edit appeal', 'description': 'Update appeal case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:51:30.217',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'timeExtensions': [],
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'journeyType': 'aip',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'sendDirectionActionAvailable': 'No',
    'changeDirectionDueDateActionAvailable': 'No',
    'homeOfficeReferenceNumber': 'A1234567',
    'currentCaseStateVisibleToJudge': 'appealStarted'
  }
}, {
  'id': 'startAppeal',
  'event': { 'eventName': 'Start your appeal', 'description': 'Create case AIP' },
  'user': { 'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4', 'lastName': 'Romero', 'firstName': 'Pedro' },
  'createdDate': '2020-04-14T14:51:12.229',
  'caseTypeVersion': 1,
  'state': { 'id': 'appealStarted', 'name': 'Appeal started' },
  'data': {
    'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
    'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
    'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
    'appealGroundsForDisplay': [],
    'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
    'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
    'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
    'haveHearingAttendeesAndDurationBeenRecorded': 'No',
    'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
    'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
    'appealReferenceNumber': 'DRAFT',
    'uploadAddendumEvidenceActionAvailable': 'No',
    'journeyType': 'aip',
    'uploadAdditionalEvidenceActionAvailable': 'No',
    'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
    'sendDirectionActionAvailable': 'No',
    'changeDirectionDueDateActionAvailable': 'No',
    'currentCaseStateVisibleToJudge': 'appealStarted'
  }
} ];
