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
      }
    ],
    "appealReviewOutcome": "decisionMaintained",
    "hearingCentre": "birmingham",
  }
}

module.exports = { ...uploadAddendumEvidence };