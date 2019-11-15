module.exports = {
  path: '/citizens/:userId/jurisdictions/:jurisdictionId/case-types/:caseType/cases',
  method: 'POST',
  template: {
    "id": () => Math.floor(Math.random() * 10000000),
    "jurisdiction": "IA",
    "state": "appealStarted",
    "version": 0,
    "case_type_id": "Asylum",
    "created_date": "2019-11-15T11:07:21.698",
    "last_modified": "2019-11-15T11:07:21.749",
    "security_classification": "PUBLIC",
    "case_data": {
      "journeyType": "aip"
    },
    "data_classification": {
      "journeyType": "PUBLIC"
    },
    "after_submit_callback_response": {
      "confirmation_header": "# Appeal saved\nYou still need to submit it",
      "confirmation_body": "#### Ready to submit?\n\n[Submit your appeal](/case/IA/Asylum/1573816041630157/trigger/submitAppeal) when you are ready.\n\n#### Not ready to submit yet?\nYou can return to the case to make changes."
    },
    "callback_response_status_code": 200,
    "callback_response_status": "CALLBACK_COMPLETED",
    "delete_draft_response_status_code": null,
    "delete_draft_response_status": null,
    "security_classifications": {
      "journeyType": "PUBLIC"
    }
  }
};
