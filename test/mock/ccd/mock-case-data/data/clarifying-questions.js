const clarifyingQuestionsCaseData = {
    'id': 6,
    'jurisdiction': 'IA',
    'state': 'awaitingClarifyingQuestionsAnswers',
    'version': 12,
    'case_type_id': 'Asylum',
    'created_date': '2020-02-07T16:39:39.894',
    'last_modified': '2020-02-11T12:18:39.813',
    'case_data': {
      "appellantHasFixedAddress": "Yes",
      "subscriptions": [
        {
          "id": "ff6cfb21-eab8-44f5-ba0a-6e9d5667c22a",
          "value": {
            "email": "test@email.com",
            "wantsSms": "No",
            "subscriber": "appellant",
            "wantsEmail": "Yes"
          }
        }
      ],
      "appellantDateOfBirth": "1980-01-01",
      "appellantAddress": {
        "County": "",
        "Country": "United Kingdom",
        "PostCode": "W1J 7NT",
        "PostTown": "LONDON",
        "AddressLine1": "149 PICCADILLY",
        "AddressLine2": ""
      },
      "applicationOutOfTimeExplanation": "My reason for being late",
      "timeExtensions": [],
      "appealReferenceNumber": "PA/50005/2020",
      "appellantGivenNames": "Pablo",
      "directions": [
        {
          "id": "3",
          "value": {
            "tag": "requestClarifyingQuestions",
            "dateDue": "2020-05-07",
            "parties": "appellant",
            "dateSent": "2020-04-23",
            "explanation": "You need to answer some questions about your appeal.",
            "previousDates": [],
            "clarifyingQuestions": [
              {
                "id": "947398d5-bd81-4e7f-b3ed-1be73be5ba56",
                "value": {
                  "question": "Give us some more information about:\n- What are their ages?\n- What are their names?"
                }
              },
              {
                "id": "ddc8a194-30b3-40d9-883e-d034a7451170",
                "value": {
                  "question": "Tell us more about your health issues\n- How long have you suffered from this problem?\n- How does it affect your daily life?"
                }
              }
            ]
          }
        },
        {
          "id": "2",
          "value": {
            "tag": "requestReasonsForAppeal",
            "dateDue": "2020-05-21",
            "parties": "appellant",
            "dateSent": "2020-04-23",
            "explanation": "You must now tell us why you think the Home Office decision to refuse your claim is wrong.",
            "previousDates": [],
            "clarifyingQuestions": []
          }
        },
        {
          "id": "1",
          "value": {
            "tag": "respondentEvidence",
            "dateDue": "2020-05-07",
            "parties": "respondent",
            "dateSent": "2020-04-23",
            "explanation": "A notice of appeal has been lodged against this asylum decision.\n\nYou must now send all documents to the case officer. The case officer will send them to the other party. You have 14 days to supply these documents.\n\nYou must include:\n- the notice of decision\n- any other document provided to the appellant giving reasons for that decision\n- any statements of evidence\n- the application form\n- any record of interview with the appellant in relation to the decision being appealed\n- any other unpublished documents on which you rely\n- the notice of any other appealable decision made in relation to the appellant",
            "previousDates": [],
            "clarifyingQuestions": []
          }
        }
      ],
      "journeyType": "aip",
      "appealType": "protection",
      "appellantFamilyName": "Jimenez",
      "reasonsForAppealDecision": "I think HO decision is wrong, my reason below:\nbla bla",
      "appellantNationalities": [
        {
          "id": "5eb39d73-eff3-46d8-a27c-25143f27d3b9",
          "value": {
            "code": "AO"
          }
        }
      ],
      "homeOfficeDecisionDate": "2020-01-01",
      "searchPostcode": "W1J 7NT",
      "submissionOutOfTime": "Yes",
      "homeOfficeReferenceNumber": "A1234567"
    }
  };
  
  module.exports = { ...clarifyingQuestionsCaseData };
  