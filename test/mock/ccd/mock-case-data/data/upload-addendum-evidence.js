const uploadAddendumEvidence = {
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
    "addendumEvidence": [
      {
        "id": "d8403157-cbc8-4441-8f0e-831d7911d070",
        "value": {
          "description": "Why evidence is late.",
          "document": {
            "document_filename": "test_doc.pdf",
            "document_url": "http://dm-store:4506/documents/c1d139da-2110-4062-9e10-922a3c63b3aa",
            "document_binary_url": "http://dm-store:4506/documents/c1d139da-2110-4062-9e10-922a3c63b3aa/binary"
          }
        }
      },
      {
        "id": "2d33e255-609c-47e2-8a10-c8056945eaa7",
        "value": {
          "description": "Why evidence is late.",
          "document": {
            "document_filename": "test_doc.pdf",
            "document_url": "http://dm-store:4506/documents/a9970992-749a-4c8b-9b92-349ef110b0ca",
            "document_binary_url": "http://dm-store:4506/documents/a9970992-749a-4c8b-9b92-349ef110b0ca/binary"
          }
        }
      }
    ]
  }
}

module.exports = { ...uploadAddendumEvidence };