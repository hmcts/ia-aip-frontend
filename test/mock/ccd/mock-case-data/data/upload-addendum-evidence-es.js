const uploadAddendumEvidenceES = {
  "total": 1,
  "cases": [
    {
      'id': 17,
      'jurisdiction': 'IA',
      'state': 'preHearing',
      'version': 17,
      'case_type_id': 'Asylum',
      'created_date': '2022-06-12T10:41:51.55',
      'last_modified': '2022-06-12T10:43:14.23',
      "case_data": {
        "journeyType": "aip",
        "homeOfficeReferenceNumber": "123456789",
        "appellantInUk": "Yes",
        "homeOfficeDecisionDate": "2022-06-05",
        "submissionOutOfTime": "No",
        "appellantGivenNames": "Abc",
        "appellantFamilyName": "cba",
        "appellantDateOfBirth": "1990-01-01",
        "appellantNationalities": [
          {
            "value": {
              "code": "AO"
            }
          }
        ],
        "appellantAddress": {
          "AddressLine1": "241 STEELHOUSE LANE",
          "AddressLine2": "",
          "PostTown": "WOLVERHAMPTON",
          "County": "",
          "PostCode": "WV2 2AB",
          "Country": "United Kingdom"
        },
        "appellantHasFixedAddress": "Yes",
        "appealType": "deprivation",
        "appellantEmailAddress": "abc@example.com",
        "subscriptions": [
          {
            "value": {
              "subscriber": "appellant",
              "wantsEmail": "Yes",
              "email": "abc@example.com",
              "wantsSms": "No",
              "mobileNumber": null
            }
          }
        ],
        "reasonsForAppealDecision": "asdadadadadadadadadsadfadad",
        "isInterpreterServicesNeeded": "No",
        "isHearingLoopNeeded": "No",
        "isHearingRoomNeeded": "No",
        "multimediaEvidence": "No",
        "multimediaEvidenceDescription": null,
        "singleSexCourt": "No",
        "inCameraCourt": "No",
        "physicalOrMentalHealthIssues": "No",
        "pastExperiences": "No",
        "additionalRequests": "No",
        "isWitnessesAttending": "No",
        "isEvidenceFromOutsideUkInCountry": "No",
        "bringOwnMultimediaEquipment": null,
        "singleSexCourtType": null,
        "singleSexCourtTypeDescription": null,
        "inCameraCourtDescription": null,
        "physicalOrMentalHealthIssuesDescription": null,
        "pastExperiencesDescription": null,
        "additionalRequestsDescription": null,
        "remoteVideoCall": "Yes",
        "remoteVideoCallDescription": null,
        "appellantStateless": "hasNationality",
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
        "addendumEvidenceDocuments": [
          {
            "id": "7",
            "value": {
              "document": {
                "document_url": "http://dm-store:4506/documents/e0f634e7-9ac6-4e78-ac1e-dc58196f61d3",
                "document_filename": "test_file.docx"
              },
              "description": "Reason evidence is late. This is an explanation on why I provided my evidence late.",
              "tag": "addendumEvidence",
              "dateUploaded": "16 June 2022"
            }
          },
          {
            "id": "5",
            "value": {
              "document": {
                "document_url": "http://dm-store:4506/documents/e0f634e7-9ac6-4e78-ac1e-dc58196f61d3",
                "document_filename": "test_file.docx"
              }
            },
            "tag": "addendumEvidence",
            "suppliedBy": "The respondent (through the Case Officer)",
            "description": "Reason evidence is late as recorded by the Case Officer.",
            "dateUploaded": "24 June 2022"
          },
          {
            "id": "4",
            "value": {
              "document": {
                "document_url": "http://dm-store:4506/documents/e0f634e7-9ac6-4e78-ac1e-dc58196f61d3",
                "document_filename": "test_file.docx"
              }
            },
            "tag": "addendumEvidence",
            "suppliedBy": "The appellant(through the Case Officer)",
            "description": "Why it was late as recorded by case worker.",
            "dateUploaded": "24 June 2022"
          },
          {
            "id": "3",
            "value": {
              "document": {
                "document_url": "http://dm-store:4506/documents/e0f634e7-9ac6-4e78-ac1e-dc58196f61d3",
                "document_filename": "test_file.docx"
              }
            },
            "tag": "addendumEvidence",
            "suppliedBy": "The respondent",
            "description": "Why respondent submitted evidence after bundling.",
            "dateUploaded": "23 June 2022"
          },

        ],
        "appealReviewOutcome": "decisionMaintained",
        "hearingCentre": "birmingham",
      }
    }
    ]
}

module.exports = { ...uploadAddendumEvidenceES };