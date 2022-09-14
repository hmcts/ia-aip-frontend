function getNextState(body) {
  switch (body.event.id) {
    case 'editAppeal':
      return 'appealStarted';
    case 'submitAppeal':
      return 'appealSubmitted';
    case 'editReasonsForAppeal':
      return 'awaitingReasonsForAppeal';
    case 'submitReasonsForAppeal':
      return 'reasonsForAppealSubmitted';
    case 'editTimeExtension':
      return 'awaitingReasonsForAppeal';
    case 'submitTimeExtension':
      return 'awaitingReasonsForAppeal';
    case 'editClarifyingQuestionAnswers':
      return 'awaitingClarifyingQuestionsAnswers';
    case 'submitClarifyingQuestionAnswers':
      return 'clarifyingQuestionsAnswersSubmitted';
    case 'submitCmaRequirements':
      return 'cmaRequirementsSubmitted';
    case 'editCmaRequirements':
      return 'awaitingCmaRequirements';
    case 'listCma':
      return 'cmaListed';
    case 'makeAnApplication':
      return 'awaitingReasonsForAppeal';
    case 'uploadAddendumEvidenceLegalRep':
      return 'preHearing';
    default:
      throw `Event type ${body.eventType} no next state set`
  }
}

module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases/:caseId/events',
  method: 'POST',
  template: {
    "id": params => Number(params.caseId),
    "jurisdiction": "IA",
    "state": (params, query, body) => {
      return getNextState(body);
    },
    "version": 10,
    "case_type_id": "Asylum",
    "created_date": "2019-11-13T10:18:43.271",
    "last_modified": "2019-11-15T11:28:36.109",
    "security_classification": "PUBLIC",
    "case_data": (params, query, body) => {
      return { ...body.data }
    },
    "data_classification": {
      "journeyType": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    },
    "after_submit_callback_response": {
      "confirmation_header": "# Appeal saved\nYou still need to submit it",
      "confirmation_body": "#### Ready to submit?\n\n[Submit your appeal](/case/IA/Asylum/1573640323267110/trigger/submitAppeal) when you are ready.\n\n#### Not ready to submit yet?\nYou can return to the case to make changes."
    },
    "callback_response_status_code": 200,
    "callback_response_status": "CALLBACK_COMPLETED",
    "delete_draft_response_status_code": null,
    "delete_draft_response_status": null,
    "security_classifications": {
      "journeyType": "PUBLIC",
      "homeOfficeReferenceNumber": "PUBLIC"
    }
  }
};
