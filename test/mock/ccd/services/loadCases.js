const cache = require('memory-cache');

const usersToCaseData = {
  '1': [],
  '2': [ {
    "id": 1573640323267110,
    "jurisdiction": "IA",
    "state": "appealStarted",
    "version": 8,
    "case_type_id": "Asylum",
    "created_date": "2019-11-13T10:18:43.271",
    "last_modified": "2019-11-13T15:35:31.356",
    "security_classification": "PUBLIC",
    "case_data": {
      "journeyType": "aip",
      "homeOfficeReferenceNumber": "A1234564"
    },
    "data_classification": {
      "journeyType": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    },
    "after_submit_callback_response": null,
    "callback_response_status_code": null,
    "callback_response_status": null,
    "delete_draft_response_status_code": null,
    "delete_draft_response_status": null,
    "security_classifications": {
      "journeyType": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    }
  } ],
  '3': [ {
    "id": 1573640323267110,
    "jurisdiction": "IA",
    "state": "appealSubmitted",
    "version": 9,
    "case_type_id": "Asylum",
    "created_date": "2020-02-12T10:41:51.55",
    "last_modified": "2020-02-12T10:43:14.23",
    "security_classification": "PUBLIC",
    "case_data": {
      "appellantHasFixedAddress": "Yes",
      "subscriptions": [ {
        "id": "ce208f30-0aae-41a1-95a6-8b79333fa274",
        "value": { "email": "alejandro@example.net", "wantsSms": "No", "subscriber": "appellant", "wantsEmail": "Yes" }
      } ],
      "appellantDateOfBirth": "2019-01-01",
      "appellantAddress": {
        "County": "",
        "Country": "United Kingdom",
        "PostCode": "W1W 7RT",
        "PostTown": "LONDON",
        "AddressLine1": "60 GREAT PORTLAND STREET",
        "AddressLine2": ""
      },
      "appealType": "protection",
      "appellantGivenNames": "aa",
      "journeyType": "aip",
      "appellantFamilyName": "asd",
      "appellantNationalities": [ { "id": "39dd0f68-aa9f-41b0-99a8-e553e1ce0fb1", "value": { "code": "AX" } } ],
      "homeOfficeDecisionDate": "2020-02-10",
      "searchPostcode": "W1W 7RT",
      "submissionOutOfTime": "No",
      "homeOfficeReferenceNumber": "A1234567"
    },
    "data_classification": {
      "appellantHasFixedAddress": "PUBLIC",
      "subscriptions": {
        "value": [ {
          "id": "ce208f30-0aae-41a1-95a6-8b79333fa274",
          "value": { "email": "PUBLIC", "wantsSms": "PUBLIC", "subscriber": "PUBLIC", "wantsEmail": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "appellantDateOfBirth": "PUBLIC",
      "appellantAddress": {
        "value": {
          "County": "PUBLIC",
          "Country": "PUBLIC",
          "PostCode": "PUBLIC",
          "PostTown": "PUBLIC",
          "AddressLine1": "PUBLIC",
          "AddressLine2": "PUBLIC"
        }, "classification": "PUBLIC"
      },
      "appealType": "PUBLIC",
      "appellantGivenNames": "PUBLIC",
      "journeyType": "PUBLIC",
      "appellantFamilyName": "PUBLIC",
      "appellantNationalities": {
        "value": [ {
          "id": "39dd0f68-aa9f-41b0-99a8-e553e1ce0fb1",
          "value": { "code": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "homeOfficeDecisionDate": "PUBLIC",
      "searchPostcode": "PUBLIC",
      "submissionOutOfTime": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    },
    "after_submit_callback_response": null,
    "callback_response_status_code": null,
    "callback_response_status": null,
    "delete_draft_response_status_code": null,
    "delete_draft_response_status": null,
    "security_classifications": {
      "appellantHasFixedAddress": "PUBLIC",
      "subscriptions": {
        "value": [ {
          "id": "ce208f30-0aae-41a1-95a6-8b79333fa274",
          "value": { "email": "PUBLIC", "wantsSms": "PUBLIC", "subscriber": "PUBLIC", "wantsEmail": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "appellantDateOfBirth": "PUBLIC",
      "appellantAddress": {
        "value": {
          "County": "PUBLIC",
          "Country": "PUBLIC",
          "PostCode": "PUBLIC",
          "PostTown": "PUBLIC",
          "AddressLine1": "PUBLIC",
          "AddressLine2": "PUBLIC"
        }, "classification": "PUBLIC"
      },
      "appealType": "PUBLIC",
      "appellantGivenNames": "PUBLIC",
      "journeyType": "PUBLIC",
      "appellantFamilyName": "PUBLIC",
      "appellantNationalities": {
        "value": [ {
          "id": "39dd0f68-aa9f-41b0-99a8-e553e1ce0fb1",
          "value": { "code": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "homeOfficeDecisionDate": "PUBLIC",
      "searchPostcode": "PUBLIC",
      "submissionOutOfTime": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    }
  } ],
  '4': [ {
    "id": 1573640323267110,
    "jurisdiction": "IA",
    "state": "awaitingReasonsForAppeal",
    "version": 12,
    "case_type_id": "Asylum",
    "created_date": "2020-02-07T16:39:39.894",
    "last_modified": "2020-02-11T12:18:39.813",
    "security_classification": "PUBLIC",
    "case_data": {
      "appellantHasFixedAddress": "Yes",
      "subscriptions": [ {
        "id": "ef8cb4ca-9df8-42f5-b326-e78725de99be",
        "value": { "email": "alejandro@example.net", "wantsSms": "No", "subscriber": "appellant", "wantsEmail": "Yes" }
      } ],
      "appellantDateOfBirth": "1990-01-01",
      "appellantAddress": {
        "County": "",
        "Country": "United Kingdom",
        "PostCode": "W1W 7RT",
        "PostTown": "LONDON",
        "AddressLine1": "60 GREAT PORTLAND STREET",
        "AddressLine2": ""
      },
      "appealType": "protection",
      "appellantGivenNames": "Alex",
      "journeyType": "aip",
      "appellantFamilyName": "NotHere",
      "appellantNationalities": [ { "id": "deb1b9fe-43f7-4a8b-89ef-951eeda7e11d", "value": { "code": "AL" } } ],
      "homeOfficeDecisionDate": "2020-02-01",
      "searchPostcode": "W1W 7RT",
      "submissionOutOfTime": "No",
      "homeOfficeReferenceNumber": "A1234567"
    },
    "data_classification": {
      "appellantHasFixedAddress": "PUBLIC",
      "subscriptions": {
        "value": [ {
          "id": "ef8cb4ca-9df8-42f5-b326-e78725de99be",
          "value": { "email": "PUBLIC", "wantsSms": "PUBLIC", "subscriber": "PUBLIC", "wantsEmail": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "appellantDateOfBirth": "PUBLIC",
      "appellantAddress": {
        "value": {
          "County": "PUBLIC",
          "Country": "PUBLIC",
          "PostCode": "PUBLIC",
          "PostTown": "PUBLIC",
          "AddressLine1": "PUBLIC",
          "AddressLine2": "PUBLIC"
        }, "classification": "PUBLIC"
      },
      "appealType": "PUBLIC",
      "appellantGivenNames": "PUBLIC",
      "journeyType": "PUBLIC",
      "appellantFamilyName": "PUBLIC",
      "appellantNationalities": {
        "value": [ {
          "id": "deb1b9fe-43f7-4a8b-89ef-951eeda7e11d",
          "value": { "code": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "homeOfficeDecisionDate": "PUBLIC",
      "searchPostcode": "PUBLIC",
      "submissionOutOfTime": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    },
    "after_submit_callback_response": null,
    "callback_response_status_code": null,
    "callback_response_status": null,
    "delete_draft_response_status_code": null,
    "delete_draft_response_status": null,
    "security_classifications": {
      "appellantHasFixedAddress": "PUBLIC",
      "subscriptions": {
        "value": [ {
          "id": "ef8cb4ca-9df8-42f5-b326-e78725de99be",
          "value": { "email": "PUBLIC", "wantsSms": "PUBLIC", "subscriber": "PUBLIC", "wantsEmail": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "appellantDateOfBirth": "PUBLIC",
      "appellantAddress": {
        "value": {
          "County": "PUBLIC",
          "Country": "PUBLIC",
          "PostCode": "PUBLIC",
          "PostTown": "PUBLIC",
          "AddressLine1": "PUBLIC",
          "AddressLine2": "PUBLIC"
        }, "classification": "PUBLIC"
      },
      "appealType": "PUBLIC",
      "appellantGivenNames": "PUBLIC",
      "journeyType": "PUBLIC",
      "appellantFamilyName": "PUBLIC",
      "appellantNationalities": {
        "value": [ {
          "id": "deb1b9fe-43f7-4a8b-89ef-951eeda7e11d",
          "value": { "code": "PUBLIC" }
        } ], "classification": "PUBLIC"
      },
      "homeOfficeDecisionDate": "PUBLIC",
      "searchPostcode": "PUBLIC",
      "submissionOutOfTime": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    }
  } ]
};

module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases',
  method: 'GET',
  cache: false,
  template: params => {
    if (params.userId === '999') {
      const caseData = cache.get('caseData');
      if (caseData) {
        return caseData;
      }
      return [];
    } else {
      return usersToCaseData[params.userId];
    }
  }
};
