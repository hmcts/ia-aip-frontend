export const multipleEventsData = {
  auditEvents: [ {
    'id': 'submitReasonsForAppeal',
    'summary': 'Submits Reasons for appeal case AIP',
    'description': 'Submits Reasons for appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Submit reasons for appeal',
    'created_date': '2020-02-27T16:46:50.355',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'reasonsForAppealSubmitted',
    'state_name': 'Reasons for appeal submitted',
    'data': {
      'appellantHasFixedAddress': 'Yes',
      'legalRepName': '',
      'subscriptions': [ {
        'id': 'a48c3f3b-b080-4209-9b52-a3c3bdfcafea',
        'value': {
          'email': 'alejandro@example.net',
          'wantsSms': 'No',
          'subscriber': 'appellant',
          'wantsEmail': 'Yes'
        }
      } ],
      'uploadedHomeOfficeBundleDocs': '- None',
      'legalRepCompany': '',
      'currentCaseStateVisibleToLegalRepresentative': 'reasonsForAppealSubmitted',
      'appealGroundsForDisplay': [],
      'legalRepresentativeName': 'Alex Citizen Admin',
      'legalRepresentativeEmailAddress': 'citizen@example.net',
      'currentCaseStateVisibleToHomeOfficeAll': 'reasonsForAppealSubmitted',
      'appealSubmissionDate': '2020-02-27',
      'legalRepresentativeDocuments': [ {
        'id': '1',
        'value': {
          'tag': 'appealSubmission',
          'document': {
            'document_url': 'http://dm-store:4506/documents/d96a03f3-af07-463d-bd65-1e2b4fd25a5b',
            'document_filename': 'PA 50004 2020-sad-appeal-form.PDF',
            'document_binary_url': 'http://dm-store:4506/documents/d96a03f3-af07-463d-bd65-1e2b4fd25a5b/binary'
          },
          'description': '',
          'dateUploaded': '2020-02-27'
        }
      } ],
      'currentCaseStateVisibleToHomeOfficeLart': 'reasonsForAppealSubmitted',
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
      'appealReferenceNumber': 'PA/50004/2020',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appealType': 'protection',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'hearingCentre': 'taylorHouse',
      'reasonsForAppealDecision': 'HELLO',
      'uploadHomeOfficeBundleAvailable': 'No',
      'appellantNationalities': [ { 'id': '70215b77-3b50-46ff-a569-42155fbb7b35', 'value': { 'code': 'AL' } } ],
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'respondentDocuments': [ {
        'id': '2',
        'value': {
          'tag': 'respondentEvidence',
          'document': {
            'document_url': 'http://dm-store:4506/documents/7aea22e8-ca47-4e3c-8cdb-d24e96e2890c',
            'document_filename': '404 1.png',
            'document_binary_url': 'http://dm-store:4506/documents/7aea22e8-ca47-4e3c-8cdb-d24e96e2890c/binary'
          },
          'description': 'blah blah',
          'dateUploaded': '2020-02-27'
        }
      }, {
        'id': '1',
        'value': {
          'tag': 'respondentEvidence',
          'document': {
            'document_url': 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192',
            'document_filename': '500.png',
            'document_binary_url': 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192/binary'
          },
          'description': 'more blah blah',
          'dateUploaded': '2020-02-27'
        }
      } ],
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-19',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'reasonsForAppealSubmitted',
      'reasonsForAppealDocuments': [ {
        'id': '9026b41d-b822-4201-83d7-4a2172cef49a',
        'value': {
          'document_url': 'http://dm-store:4506/documents/3867d40b-f1eb-477b-af49-b9a03bc27641',
          'document_filename': '1582821986580-404 1.png',
          'document_binary_url': 'http://dm-store:4506/documents/3867d40b-f1eb-477b-af49-b9a03bc27641/binary'
        }
      } ],
      'currentCaseStateVisibleToHomeOfficePou': 'reasonsForAppealSubmitted',
      'currentCaseStateVisibleToCaseOfficer': 'reasonsForAppealSubmitted',
      'currentCaseStateVisibleToHomeOfficeApc': 'reasonsForAppealSubmitted',
      'directions': [ {
        'id': '2',
        'value': {
          'tag': 'requestReasonsForAppeal',
          'dateDue': '2020-03-26',
          'parties': 'appellant',
          'dateSent': '2020-02-27',
          'explanation': 'You must now tell us why you think the Home Office decision to refuse your claim is wrong.',
          'previousDates': []
        }
      }, {
        'id': '1',
        'value': {
          'tag': 'respondentEvidence',
          'dateDue': '2020-03-12',
          'parties': 'respondent',
          'dateSent': '2020-02-27',
          'explanation': 'A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant',
          'previousDates': []
        }
      } ],
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'reasonsForAppealSubmitted',
      'appellantNameForDisplay': 'Aleka sad',
      'notificationsSent': [ {
        'id': '1582812292791532_APPEAL_SUBMITTED_APPELLANT_AIP_EMAIL',
        'value': 'd82808a1-1cf6-49c3-ad06-94c6d3cddb06'
      }, {
        'id': '1582812292791532_APPEAL_SUBMITTED_CASE_OFFICER',
        'value': '4e09a202-5173-4ed0-836d-a3474b44a4e9'
      }, {
        'id': '1582812292791532_RESPONDENT_EVIDENCE_DIRECTION',
        'value': '21694d30-9ac6-4f79-99f7-4cc93c1d7073'
      }, {
        'id': '1582812292791532_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
        'value': '877a9429-0125-4210-b51d-3a5f5fb52dee'
      }, {
        'id': '1582812292791532_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
        'value': '5ea8608d-e10d-44a1-a205-fbfc1eb901b9'
      }, {
        'id': '1582812292791532_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
        'value': '6c53974b-0e65-4e7b-ab23-37c89605157b'
      }, {
        'id': '1582812292791532_REASONS_FOR_APPEAL_SUBMITTED_CASE_OFFICER',
        'value': '9aa1b67b-66c6-46d7-a9ae-117ff9b51b3a'
      }, {
        'id': '1582812292791532_SUBMIT_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
        'value': 'da311833-49dd-4af0-b6f2-d64833c1c1ed'
      } ],
      'searchPostcode': 'W1W 7RT',
      'sendDirectionActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'appellantHasFixedAddress': 'PUBLIC',
      'legalRepName': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': 'a48c3f3b-b080-4209-9b52-a3c3bdfcafea',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'uploadedHomeOfficeBundleDocs': 'PUBLIC',
      'legalRepCompany': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'legalRepresentativeName': 'PUBLIC',
      'legalRepresentativeEmailAddress': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'appealSubmissionDate': 'PUBLIC',
      'legalRepresentativeDocuments': {
        'value': [ {
          'id': '1',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appealType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'hearingCentre': 'PUBLIC',
      'reasonsForAppealDecision': 'PUBLIC',
      'uploadHomeOfficeBundleAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '70215b77-3b50-46ff-a569-42155fbb7b35',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'respondentDocuments': {
        'value': [ {
          'id': '2',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        }, {
          'id': '1',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'reasonsForAppealDocuments': {
        'value': [ {
          'id': '9026b41d-b822-4201-83d7-4a2172cef49a',
          'classification': 'PUBLIC'
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'directions': {
        'value': [ {
          'id': '2',
          'value': {
            'tag': 'PUBLIC',
            'dateDue': 'PUBLIC',
            'parties': 'PUBLIC',
            'dateSent': 'PUBLIC',
            'explanation': 'PUBLIC',
            'previousDates': { 'value': [], 'classification': 'PUBLIC' }
          }
        }, {
          'id': '1',
          'value': {
            'tag': 'PUBLIC',
            'dateDue': 'PUBLIC',
            'parties': 'PUBLIC',
            'dateSent': 'PUBLIC',
            'explanation': 'PUBLIC',
            'previousDates': { 'value': [], 'classification': 'PUBLIC' }
          }
        } ], 'classification': 'PUBLIC'
      },
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'appellantNameForDisplay': 'PUBLIC',
      'notificationsSent': {
        'value': [ {
          'id': '1582812292791532_APPEAL_SUBMITTED_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_APPEAL_SUBMITTED_CASE_OFFICER',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_RESPONDENT_EVIDENCE_DIRECTION',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_REASONS_FOR_APPEAL_SUBMITTED_CASE_OFFICER',
          'classification': 'PUBLIC'
        }, { 'id': '1582812292791532_SUBMIT_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL', 'classification': 'PUBLIC' } ],
        'classification': 'PUBLIC'
      },
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'appellantHasFixedAddress': 'PUBLIC',
      'legalRepName': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': 'a48c3f3b-b080-4209-9b52-a3c3bdfcafea',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'uploadedHomeOfficeBundleDocs': 'PUBLIC',
      'legalRepCompany': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'legalRepresentativeName': 'PUBLIC',
      'legalRepresentativeEmailAddress': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'appealSubmissionDate': 'PUBLIC',
      'legalRepresentativeDocuments': {
        'value': [ {
          'id': '1',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appealType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'hearingCentre': 'PUBLIC',
      'reasonsForAppealDecision': 'PUBLIC',
      'uploadHomeOfficeBundleAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '70215b77-3b50-46ff-a569-42155fbb7b35',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'respondentDocuments': {
        'value': [ {
          'id': '2',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        }, {
          'id': '1',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'reasonsForAppealDocuments': {
        'value': [ {
          'id': '9026b41d-b822-4201-83d7-4a2172cef49a',
          'classification': 'PUBLIC'
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'directions': {
        'value': [ {
          'id': '2',
          'value': {
            'tag': 'PUBLIC',
            'dateDue': 'PUBLIC',
            'parties': 'PUBLIC',
            'dateSent': 'PUBLIC',
            'explanation': 'PUBLIC',
            'previousDates': { 'value': [], 'classification': 'PUBLIC' }
          }
        }, {
          'id': '1',
          'value': {
            'tag': 'PUBLIC',
            'dateDue': 'PUBLIC',
            'parties': 'PUBLIC',
            'dateSent': 'PUBLIC',
            'explanation': 'PUBLIC',
            'previousDates': { 'value': [], 'classification': 'PUBLIC' }
          }
        } ], 'classification': 'PUBLIC'
      },
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'appellantNameForDisplay': 'PUBLIC',
      'notificationsSent': {
        'value': [ {
          'id': '1582812292791532_APPEAL_SUBMITTED_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_APPEAL_SUBMITTED_CASE_OFFICER',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_RESPONDENT_EVIDENCE_DIRECTION',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_REQUEST_RESPONDENT_EVIDENCE_DIRECTION_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_RESPONDENT_EVIDENCE_SUBMITTED_CASE_OFFICER',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_REQUEST_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, {
          'id': '1582812292791532_REASONS_FOR_APPEAL_SUBMITTED_CASE_OFFICER',
          'classification': 'PUBLIC'
        }, { 'id': '1582812292791532_SUBMIT_REASONS_FOR_APPEAL_APPELLANT_AIP_EMAIL', 'classification': 'PUBLIC' } ],
        'classification': 'PUBLIC'
      },
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'submitAppeal',
    'summary': 'Submit appeal case AIP',
    'description': 'Submit appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Submit your appeal',
    'created_date': '2020-02-27T14:18:54.605',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealSubmitted',
    'state_name': 'Appeal submitted',
    'data': {
      'appellantHasFixedAddress': 'Yes',
      'legalRepName': '',
      'subscriptions': [ {
        'id': 'c7b91c10-830e-4f86-b0c0-21cd3641e821',
        'value': {
          'email': 'alejandro@example.net',
          'wantsSms': 'No',
          'subscriber': 'appellant',
          'wantsEmail': 'Yes'
        }
      } ],
      'legalRepCompany': '',
      'currentCaseStateVisibleToLegalRepresentative': 'appealSubmitted',
      'appealGroundsForDisplay': [],
      'legalRepresentativeName': 'Alex Citizen Admin',
      'legalRepresentativeEmailAddress': 'citizen@example.net',
      'currentCaseStateVisibleToHomeOfficeAll': 'appealSubmitted',
      'appealSubmissionDate': '2020-02-27',
      'legalRepresentativeDocuments': [ {
        'id': '1',
        'value': {
          'tag': 'appealSubmission',
          'document': {
            'document_url': 'http://dm-store:4506/documents/d96a03f3-af07-463d-bd65-1e2b4fd25a5b',
            'document_filename': 'PA 50004 2020-sad-appeal-form.PDF',
            'document_binary_url': 'http://dm-store:4506/documents/d96a03f3-af07-463d-bd65-1e2b4fd25a5b/binary'
          },
          'description': '',
          'dateUploaded': '2020-02-27'
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
      'appealReferenceNumber': 'PA/50004/2020',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appealType': 'protection',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'hearingCentre': 'taylorHouse',
      'appellantNationalities': [ { 'id': 'd7f765d6-b114-476d-b52b-fbbdac2ae3ae', 'value': { 'code': 'AL' } } ],
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-20',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealSubmitted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealSubmitted',
      'currentCaseStateVisibleToCaseOfficer': 'appealSubmitted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealSubmitted',
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'appealSubmitted',
      'appellantNameForDisplay': 'Aleka sad',
      'notificationsSent': [ {
        'id': '1582812292791532_APPEAL_SUBMITTED_APPELLANT_AIP_EMAIL',
        'value': 'd82808a1-1cf6-49c3-ad06-94c6d3cddb06'
      }, {
        'id': '1582812292791532_APPEAL_SUBMITTED_CASE_OFFICER',
        'value': '4e09a202-5173-4ed0-836d-a3474b44a4e9'
      } ],
      'searchPostcode': 'W1W 7RT',
      'sendDirectionActionAvailable': 'Yes',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'appellantHasFixedAddress': 'PUBLIC',
      'legalRepName': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': 'c7b91c10-830e-4f86-b0c0-21cd3641e821',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'legalRepCompany': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'legalRepresentativeName': 'PUBLIC',
      'legalRepresentativeEmailAddress': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'appealSubmissionDate': 'PUBLIC',
      'legalRepresentativeDocuments': {
        'value': [ {
          'id': '1',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appealType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'hearingCentre': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': 'd7f765d6-b114-476d-b52b-fbbdac2ae3ae',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'appellantNameForDisplay': 'PUBLIC',
      'notificationsSent': {
        'value': [ {
          'id': '1582812292791532_APPEAL_SUBMITTED_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, { 'id': '1582812292791532_APPEAL_SUBMITTED_CASE_OFFICER', 'classification': 'PUBLIC' } ],
        'classification': 'PUBLIC'
      },
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'appellantHasFixedAddress': 'PUBLIC',
      'legalRepName': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': 'c7b91c10-830e-4f86-b0c0-21cd3641e821',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'legalRepCompany': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'legalRepresentativeName': 'PUBLIC',
      'legalRepresentativeEmailAddress': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'appealSubmissionDate': 'PUBLIC',
      'legalRepresentativeDocuments': {
        'value': [ {
          'id': '1',
          'value': { 'tag': 'PUBLIC', 'document': 'PUBLIC', 'description': 'PUBLIC', 'dateUploaded': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appealType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'hearingCentre': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': 'd7f765d6-b114-476d-b52b-fbbdac2ae3ae',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'appellantNameForDisplay': 'PUBLIC',
      'notificationsSent': {
        'value': [ {
          'id': '1582812292791532_APPEAL_SUBMITTED_APPELLANT_AIP_EMAIL',
          'classification': 'PUBLIC'
        }, { 'id': '1582812292791532_APPEAL_SUBMITTED_CASE_OFFICER', 'classification': 'PUBLIC' } ],
        'classification': 'PUBLIC'
      },
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:18:16.636',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
    'data': {
      'appellantHasFixedAddress': 'Yes',
      'subscriptions': [ {
        'id': '5f1c3d7e-7f5b-47b8-8652-b7fde8360e1c',
        'value': {
          'email': 'alejandro@example.net',
          'wantsSms': 'No',
          'subscriber': 'appellant',
          'wantsEmail': 'Yes'
        }
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
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appealType': 'protection',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'appellantNationalities': [ { 'id': 'c1c6b195-aecd-46fe-a513-adf90516efec', 'value': { 'code': 'AL' } } ],
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-20',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'searchPostcode': 'W1W 7RT',
      'sendDirectionActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'appellantHasFixedAddress': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': '5f1c3d7e-7f5b-47b8-8652-b7fde8360e1c',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appealType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': 'c1c6b195-aecd-46fe-a513-adf90516efec',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'appellantHasFixedAddress': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': '5f1c3d7e-7f5b-47b8-8652-b7fde8360e1c',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appealType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': 'c1c6b195-aecd-46fe-a513-adf90516efec',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:06:28.211',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
    'data': {
      'appellantHasFixedAddress': 'Yes',
      'subscriptions': [ {
        'id': '22cb2e17-b51c-436f-a104-a19dd4222035',
        'value': {
          'email': 'alejandro@example.net',
          'wantsSms': 'No',
          'subscriber': 'appellant',
          'wantsEmail': 'Yes'
        }
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
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'appellantNationalities': [ { 'id': '64c870db-ded9-40a5-8434-d94dac3d65d9', 'value': { 'code': 'AL' } } ],
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-21',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'searchPostcode': 'W1W 7RT',
      'sendDirectionActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'appellantHasFixedAddress': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': '22cb2e17-b51c-436f-a104-a19dd4222035',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '64c870db-ded9-40a5-8434-d94dac3d65d9',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'appellantHasFixedAddress': 'PUBLIC',
      'subscriptions': {
        'value': [ {
          'id': '22cb2e17-b51c-436f-a104-a19dd4222035',
          'value': { 'email': 'PUBLIC', 'wantsSms': 'PUBLIC', 'subscriber': 'PUBLIC', 'wantsEmail': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '64c870db-ded9-40a5-8434-d94dac3d65d9',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:05:50.398',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
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
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'appellantNationalities': [ { 'id': '4f9aad8e-1f08-4f60-9faf-b2e7d3d781d8', 'value': { 'code': 'AL' } } ],
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-21',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'searchPostcode': 'W1W 7RT',
      'sendDirectionActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'appellantHasFixedAddress': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '4f9aad8e-1f08-4f60-9faf-b2e7d3d781d8',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'appellantHasFixedAddress': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'appellantAddress': {
        'value': {
          'County': 'PUBLIC',
          'Country': 'PUBLIC',
          'PostCode': 'PUBLIC',
          'PostTown': 'PUBLIC',
          'AddressLine1': 'PUBLIC',
          'AddressLine2': 'PUBLIC'
        }, 'classification': 'PUBLIC'
      },
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '4f9aad8e-1f08-4f60-9faf-b2e7d3d781d8',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'searchPostcode': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:05:42.524',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
    'data': {
      'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
      'appealGroundsForDisplay': [],
      'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
      'haveHearingAttendeesAndDurationBeenRecorded': 'No',
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'appellantNationalities': [ { 'id': '2c081f28-0a3a-4332-82d7-207150d44475', 'value': { 'code': 'AL' } } ],
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-21',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'sendDirectionActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '2c081f28-0a3a-4332-82d7-207150d44475',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'appellantNationalities': {
        'value': [ {
          'id': '2c081f28-0a3a-4332-82d7-207150d44475',
          'value': { 'code': 'PUBLIC' }
        } ], 'classification': 'PUBLIC'
      },
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:05:39.067',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
    'data': {
      'currentCaseStateVisibleToLegalRepresentative': 'appealStarted',
      'appealGroundsForDisplay': [],
      'currentCaseStateVisibleToHomeOfficeAll': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeLart': 'appealStarted',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'No',
      'haveHearingAttendeesAndDurationBeenRecorded': 'No',
      'appealReferenceNumber': 'DRAFT',
      'uploadAddendumEvidenceActionAvailable': 'No',
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'homeOfficeDecisionDate': '2020-02-16',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'No',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'No',
      'appellantDateOfBirth': '1994-07-21',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficePou': 'appealStarted',
      'currentCaseStateVisibleToCaseOfficer': 'appealStarted',
      'currentCaseStateVisibleToHomeOfficeApc': 'appealStarted',
      'journeyType': 'aip',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'sendDirectionActionAvailable': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'homeOfficeDecisionDate': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'appellantDateOfBirth': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:05:30.652',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
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
      'appellantGivenNames': 'Aleka',
      'appellantFamilyName': 'sad',
      'uploadAdditionalEvidenceActionAvailable': 'No',
      'currentCaseStateVisibleToAdminOfficer': 'appealStarted',
      'homeOfficeDecisionDate': '2020-02-16',
      'sendDirectionActionAvailable': 'No',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'homeOfficeDecisionDate': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'appellantGivenNames': 'PUBLIC',
      'appellantFamilyName': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'homeOfficeDecisionDate': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:05:23.387',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
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
      'homeOfficeDecisionDate': '2020-02-16',
      'sendDirectionActionAvailable': 'No',
      'changeDirectionDueDateActionAvailable': 'No',
      'submissionOutOfTime': 'No',
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'homeOfficeDecisionDate': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'homeOfficeDecisionDate': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'submissionOutOfTime': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'editAppeal',
    'summary': 'Update appeal case AIP',
    'description': 'Update appeal case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Edit appeal',
    'created_date': '2020-02-27T14:05:06.662',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
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
      'homeOfficeReferenceNumber': 'A1234567'
    },
    'data_classification': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC',
      'homeOfficeReferenceNumber': 'PUBLIC'
    }
  }, {
    'id': 'startAppeal',
    'summary': 'Create case AIP',
    'description': 'Create case AIP',
    'user_id': 'ef12998f-e2fb-46de-ae1f-51f4033c929f',
    'user_last_name': 'Citizen Admin',
    'user_first_name': 'Alex',
    'event_name': 'Start your appeal',
    'created_date': '2020-02-27T14:04:52.795',
    'case_type_id': 'Asylum',
    'case_type_version': 5,
    'state_id': 'appealStarted',
    'state_name': 'Appeal started',
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
      'changeDirectionDueDateActionAvailable': 'No'
    },
    'data_classification': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC'
    },
    'security_classification': 'PUBLIC',
    'significant_item': null,
    'security_classifications': {
      'uploadAddendumEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'uploadAdditionalEvidenceHomeOfficeActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToLegalRepresentative': 'PUBLIC',
      'appealGroundsForDisplay': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeAll': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeLart': 'PUBLIC',
      'uploadAddendumEvidenceLegalRepActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeGeneric': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficePou': 'PUBLIC',
      'haveHearingAttendeesAndDurationBeenRecorded': 'PUBLIC',
      'currentCaseStateVisibleToCaseOfficer': 'PUBLIC',
      'currentCaseStateVisibleToHomeOfficeApc': 'PUBLIC',
      'appealReferenceNumber': 'PUBLIC',
      'uploadAddendumEvidenceActionAvailable': 'PUBLIC',
      'journeyType': 'PUBLIC',
      'uploadAdditionalEvidenceActionAvailable': 'PUBLIC',
      'currentCaseStateVisibleToAdminOfficer': 'PUBLIC',
      'sendDirectionActionAvailable': 'PUBLIC',
      'changeDirectionDueDateActionAvailable': 'PUBLIC'
    }
  } ]
};
