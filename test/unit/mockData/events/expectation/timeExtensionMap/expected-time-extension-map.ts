export const expectedTimeExtensionMap = [
  {
    'id': '25134779-79b7-4519-a4bd-e23e2f1d5ba8',
    'externalId': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
    'historyData': {
      'id': 'reviewTimeExtension',
      'event': {
        'eventName': 'Review time extension',
        'description': ''
      },
      'user': {
        'id': 'c6181c91-acd0-40cf-aeab-ddf1ff9e39ae',
        'lastName': 'Officer',
        'firstName': 'Case'
      },
      'createdDate': '2020-04-15T13:33:20.945',
      'caseTypeVersion': 2,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'b47bb4ae-5d6b-452c-974e-1f099ca6c3a8',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes'
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'reviewTimeExtensionDate': '2020-04-15',
        'timeExtensions': [
          {
            'id': '85795256-3f3c-44b2-8f27-177a98106e48',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'refused',
              'evidence': [
                {
                  'id': '43564a29-2067-4138-99a9-1e2ddc0ee785',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14'
            }
          },
          {
            'id': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need more time while I am waiting for a letter',
              'status': 'granted',
              'decision': 'granted',
              'requestDate': '2020-04-15',
              'decisionReason': 'I have granted your request you know have more time'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '0094baea-66e8-45e2-9d68-5f861e93075a',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT',
        'reviewTimeExtensionReason': 'I need more time while I am waiting for a letter'
      }
    }
  },
  {
    'id': '0af8b4fe-664c-41d2-9587-2cb96e5bfe51',
    'externalId': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
    'historyData': {
      'id': 'submitTimeExtension',
      'event': {
        'eventName': 'Request time extension',
        'description': 'Submit time extension AIP'
      },
      'user': {
        'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4',
        'lastName': 'Romero LOL',
        'firstName': 'Pedro'
      },
      'createdDate': '2020-04-15T13:30:16.831',
      'caseTypeVersion': 2,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'b47bb4ae-5d6b-452c-974e-1f099ca6c3a8',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes',
              'mobileNumber': null
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'reviewTimeExtensionDate': '2020-04-14',
        'timeExtensions': [
          {
            'id': '85795256-3f3c-44b2-8f27-177a98106e48',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'refused',
              'evidence': [
                {
                  'id': '43564a29-2067-4138-99a9-1e2ddc0ee785',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14'
            }
          },
          {
            'id': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need more time while I am waiting for a letter',
              'status': 'submitted',
              'requestDate': '2020-04-15'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '0094baea-66e8-45e2-9d68-5f861e93075a',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT',
        'reviewTimeExtensionReason': 'I need an extra 2 weeks'
      }
    }
  },
  {
    'id': 'c5532555-aa49-4a11-88a4-69d98d27ba95',
    'externalId': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
    'historyData': {
      'id': 'reviewTimeExtension',
      'event': {
        'eventName': 'Review time extension',
        'description': ''
      },
      'user': {
        'id': 'c6181c91-acd0-40cf-aeab-ddf1ff9e39ae',
        'lastName': 'Officer',
        'firstName': 'Case'
      },
      'createdDate': '2020-04-14T15:14:00.647',
      'caseTypeVersion': 1,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'f561fe3c-94b3-4ad6-b3ff-c11a35abd4f2',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes'
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'reviewTimeExtensionDate': '2020-04-14',
        'timeExtensions': [
          {
            'id': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'refused',
              'decision': 'refused',
              'evidence': [
                {
                  'id': '0fe958e9-ba00-40bb-8237-234c6f0384b4',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14',
              'decisionReason': 'Not enough information'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '076a2495-6660-4d61-aa34-ba243d82d286',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT',
        'reviewTimeExtensionReason': 'I need an extra 2 weeks'
      }
    }
  },
  {
    'id': '1d1479a7-95a4-42c8-b718-44b764e6b935',
    'externalId': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
    'historyData': {
      'id': 'submitTimeExtension',
      'event': {
        'eventName': 'Request time extension',
        'description': 'Submit time extension AIP'
      },
      'user': {
        'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4',
        'lastName': 'Romero LOL',
        'firstName': 'Pedro'
      },
      'createdDate': '2020-04-14T14:57:11.293',
      'caseTypeVersion': 1,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'f561fe3c-94b3-4ad6-b3ff-c11a35abd4f2',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes',
              'mobileNumber': null
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'timeExtensions': [
          {
            'id': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'submitted',
              'evidence': [
                {
                  'id': '0fe958e9-ba00-40bb-8237-234c6f0384b4',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '076a2495-6660-4d61-aa34-ba243d82d286',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT'
      }
    }
  },
  {
    'id': '021e9ffa-caf3-41cc-a1c3-4f024e7f73b8',
    'externalId': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
    'historyData': {
      'id': 'reviewTimeExtension',
      'event': {
        'eventName': 'Review time extension',
        'description': ''
      },
      'user': {
        'id': 'c6181c91-acd0-40cf-aeab-ddf1ff9e39ae',
        'lastName': 'Officer',
        'firstName': 'Case'
      },
      'createdDate': '2020-04-15T13:33:20.945',
      'caseTypeVersion': 2,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'b47bb4ae-5d6b-452c-974e-1f099ca6c3a8',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes'
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'reviewTimeExtensionDate': '2020-04-15',
        'timeExtensions': [
          {
            'id': '85795256-3f3c-44b2-8f27-177a98106e48',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'refused',
              'evidence': [
                {
                  'id': '43564a29-2067-4138-99a9-1e2ddc0ee785',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14'
            }
          },
          {
            'id': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need more time while I am waiting for a letter',
              'status': 'granted',
              'decision': 'granted',
              'requestDate': '2020-04-15',
              'decisionReason': 'I have granted your request you know have more time'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '0094baea-66e8-45e2-9d68-5f861e93075a',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT',
        'reviewTimeExtensionReason': 'I need more time while I am waiting for a letter'
      }
    }
  },
  {
    'id': '7e7b8323-5d28-4598-b799-c000adcd6f53',
    'externalId': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
    'historyData': {
      'id': 'submitTimeExtension',
      'event': {
        'eventName': 'Request time extension',
        'description': 'Submit time extension AIP'
      },
      'user': {
        'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4',
        'lastName': 'Romero LOL',
        'firstName': 'Pedro'
      },
      'createdDate': '2020-04-15T13:30:16.831',
      'caseTypeVersion': 2,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'b47bb4ae-5d6b-452c-974e-1f099ca6c3a8',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes',
              'mobileNumber': null
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'reviewTimeExtensionDate': '2020-04-14',
        'timeExtensions': [
          {
            'id': '85795256-3f3c-44b2-8f27-177a98106e48',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'refused',
              'evidence': [
                {
                  'id': '43564a29-2067-4138-99a9-1e2ddc0ee785',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14'
            }
          },
          {
            'id': 'fe677942-46f6-45fc-8552-19d52cc1cbab',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need more time while I am waiting for a letter',
              'status': 'submitted',
              'requestDate': '2020-04-15'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '0094baea-66e8-45e2-9d68-5f861e93075a',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT',
        'reviewTimeExtensionReason': 'I need an extra 2 weeks'
      }
    }
  },
  {
    'id': '3971a48b-de17-410d-b846-2a76f6dd5811',
    'externalId': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
    'historyData': {
      'id': 'reviewTimeExtension',
      'event': {
        'eventName': 'Review time extension',
        'description': ''
      },
      'user': {
        'id': 'c6181c91-acd0-40cf-aeab-ddf1ff9e39ae',
        'lastName': 'Officer',
        'firstName': 'Case'
      },
      'createdDate': '2020-04-14T15:14:00.647',
      'caseTypeVersion': 1,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'f561fe3c-94b3-4ad6-b3ff-c11a35abd4f2',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes'
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'reviewTimeExtensionDate': '2020-04-14',
        'timeExtensions': [
          {
            'id': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'refused',
              'decision': 'refused',
              'evidence': [
                {
                  'id': '0fe958e9-ba00-40bb-8237-234c6f0384b4',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14',
              'decisionReason': 'Not enough information'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '076a2495-6660-4d61-aa34-ba243d82d286',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT',
        'reviewTimeExtensionReason': 'I need an extra 2 weeks'
      }
    }
  },
  {
    'id': '487b5a24-1e47-4fe8-8f11-5ba2ca93d9da',
    'externalId': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
    'historyData': {
      'id': 'submitTimeExtension',
      'event': {
        'eventName': 'Request time extension',
        'description': 'Submit time extension AIP'
      },
      'user': {
        'id': 'ee125a02-b73d-4783-8bb2-f4ca0d6060e4',
        'lastName': 'Romero LOL',
        'firstName': 'Pedro'
      },
      'createdDate': '2020-04-14T14:57:11.293',
      'caseTypeVersion': 1,
      'state': {
        'id': 'awaitingReasonsForAppeal',
        'name': 'Awaiting reasons for appeal'
      },
      'data': {
        'subscriptions': [
          {
            'id': 'f561fe3c-94b3-4ad6-b3ff-c11a35abd4f2',
            'value': {
              'email': 'alejandro@example.net',
              'wantsSms': 'No',
              'subscriber': 'appellant',
              'wantsEmail': 'Yes',
              'mobileNumber': null
            }
          }
        ],
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
        'directions': [
          {
            'id': '2',
            'value': {
              'tag': 'requestReasonsForAppeal',
              'dateDue': '2020-05-12',
              'parties': 'appellant',
              'dateSent': '2020-04-14',
              'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
              'previousDates': []
            }
          },
          {
            'id': '1',
            'value': {
              'tag': 'respondentEvidence',
              'dateDue': '2020-04-28',
              'parties': 'respondent',
              'dateSent': '2020-04-14',
              'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
              'previousDates': []
            }
          }
        ],
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
        'legalRepresentativeDocuments': [
          {
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
          }
        ],
        'currentCaseStateVisibleToHomeOfficeLart': 'awaitingReasonsForAppeal',
        'timeExtensions': [
          {
            'id': '0f2202ac-538c-4ae7-809e-db786bc0fe07',
            'value': {
              'state': 'awaitingReasonsForAppeal',
              'reason': 'I need an extra 2 weeks',
              'status': 'submitted',
              'evidence': [
                {
                  'id': '0fe958e9-ba00-40bb-8237-234c6f0384b4',
                  'value': {
                    'document_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4',
                    'document_filename': 'supporting evidence.jpg',
                    'document_binary_url': 'http://dm-store:4506/documents/0a1c449d-a312-48d7-9b8e-36e1b83e39f4/binary'
                  }
                }
              ],
              'requestDate': '2020-04-14'
            }
          }
        ],
        'appealReferenceNumber': 'PA/50002/2020',
        'appealType': 'protection',
        'uploadAdditionalEvidenceActionAvailable': 'No',
        'appellantNationalities': [
          {
            'id': '076a2495-6660-4d61-aa34-ba243d82d286',
            'value': {
              'code': 'DZ'
            }
          }
        ],
        'homeOfficeDecisionDate': '2020-01-21',
        'changeDirectionDueDateActionAvailable': 'No',
        'respondentDocuments': [
          {
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
          }
        ],
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
        'notificationsSent': [
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_OUT_OF_TIME_APPELLANT_AIP_EMAIL',
            'value': '6aa61765-589e-4697-b802-6096b3a9904a'
          },
          {
            'id': '1586875872262337_APPEAL_SUBMITTED_CASE_OFFICER',
            'value': '5305d1b9-2c92-4294-843b-75fa1b3e1f7a'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_DIRECTION',
            'value': '0495e298-8161-4f47-b0c9-1013e460d1dd'
          },
          {
            'id': '1586875872262337_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
            'value': '0608ba12-ac68-4341-934a-6d7451389d6b'
          },
          {
            'id': '1586875872262337_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
            'value': '7996a34b-caac-4949-9c34-e367bf3e9016'
          },
          {
            'id': '1586875872262337_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
            'value': '4b45bae0-9146-429f-9a0e-f3b69878df50'
          }
        ],
        'searchPostcode': 'W1W 7RT'
      }
    }
  }
];
