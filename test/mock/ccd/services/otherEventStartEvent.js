function getCurrentState(params) {
  switch (params.eventType) {
    case 'editAppeal':
      return 'appealStarted';
    case 'submitAppeal':
      return 'appealStarted';
    case 'editReasonsForAppeal':
      return 'awaitingReasonsForAppeal';
    case 'submitReasonsForAppeal':
      return 'awaitingReasonsForAppeal';
    case 'editTimeExtension':
      return 'awaitingReasonsForAppeal';
    case 'submitTimeExtension':
      return 'awaitingReasonsForAppeal';
    case 'editClarifyingQuestionAnswers':
      return 'awaitingClarifyingQuestionsAnswers'
    case 'awaitingCmaRequirements':
      return  'awaitingCmaRequirements';
    case 'submitClarifyingQuestionAnswers':
      return 'clarifyingQuestionsAnswersSubmitted';
    default:
      throw `Event type ${params.eventType} no current state set`
  }
}

module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases/:caseId/event-triggers/:eventType/token',
  method: 'GET',
  template: params => {
    return {
      "token": `${params.eventType}Token`,
      "case_details": {
        "id": parseInt(params.caseId),
        "jurisdiction": "IA",
        "state": getCurrentState(params),
        "version": 9,
        "case_type_id": "Asylum",
        "created_date": "2019-11-13T10:18:43.271",
        "last_modified": "2019-11-15T11:26:57.699",
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
      },
      "event_id": params.eventType
    }
  }
};
