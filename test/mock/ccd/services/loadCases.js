const usersToCaseData = {
  '1': [],
  '2': [{
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
  }]
};

module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases',
  method: 'GET',
  template: params => {
    return usersToCaseData[params.userId];
  }
};
