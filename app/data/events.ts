export const Events = {
  EDIT_APPEAL: {
    id: 'editAppeal',
    summary: 'Update appeal case AIP',
    description: 'Update appeal case AIP'
  },
  SUBMIT_APPEAL: {
    id: 'submitAppeal',
    summary: 'Submit appeal case AIP',
    description: 'Submit Appeal case AIP'
  },
  PAY_AND_SUBMIT_APPEAL: {
    id: 'payAndSubmitAppeal',
    summary: 'Pay and submit',
    description: 'Pay and submit'
  },
  PAYMENT_APPEAL: {
    id: 'paymentAppeal',
    summary: 'Make a payment',
    description: 'Make a payment'
  },
  EDIT_REASONS_FOR_APPEAL: {
    id: 'editReasonsForAppeal',
    summary: 'Edit reasons for appeal case AIP',
    description: 'Edit reasons for appeal case AIP'
  },
  SUBMIT_REASONS_FOR_APPEAL: {
    id: 'submitReasonsForAppeal',
    summary: 'Submits Reasons for appeal case AIP',
    description: 'Submits Reasons for appeal case AIP'
  },
  REQUEST_RESPONDENT_REVIEW: {
    id: 'requestRespondentReview',
    summary: 'Request respondent review',
    description: 'Request respondent review'
  },
  // TODO: remove event once make an application is fully working
  SUBMIT_TIME_EXTENSION: {
    id: 'submitTimeExtension',
    summary: 'Submit time extension AIP',
    description: 'Submit time extensions for case AIP'
  },
  // TODO: remove event once make an application is fully working
  REVIEW_TIME_EXTENSION: {
    id: 'reviewTimeExtension',
    summary: 'Submits review of time extension for appeal case AIP',
    description: 'Submits review of time extension for appeal case AIP'
  },
  // TODO: remove event once make an application is fully working
  EDIT_TIME_EXTENSION: {
    id: 'editTimeExtension',
    summary: 'Edit time extension AIP',
    description: 'edits time extensions for case AIP'
  },
  MAKE_AN_APPLICATION: {
    id: 'makeAnApplication',
    summary: 'Make an application',
    description: 'Make an application'
  },
  EDIT_CLARIFYING_QUESTION_ANSWERS: {
    id: 'editClarifyingQuestionAnswers',
    summary: 'Edit clarifying question answers',
    description: 'Edit clarifying question answers'
  },
  SUBMIT_CLARIFYING_QUESTION_ANSWERS: {
    id: 'submitClarifyingQuestionAnswers',
    summary: 'Submit clarifying question answers',
    description: 'Submit clarifying question answers'
  },
  EDIT_CMA_REQUIREMENTS: {
    id: 'editCmaRequirements',
    summary: 'Edit CMA requirements',
    description: 'Edit CMA requirements'
  },
  SUBMIT_CMA_REQUIREMENTS: {
    id: 'submitCmaRequirements',
    summary: 'Submit CMA requirements',
    description: 'Submit CMA requirements'
  },
  SEND_DIRECTION_WITH_QUESTIONS: {
    id: 'sendDirectionWithQuestions',
    summary: 'Direct the appellant to answer clarifying questions',
    description: 'Direct the appellant to answer clarifying questions'
  },
  UPDATE_TRIBUNAL_DECISION: {
    id: 'updateTribunalDecision',
    summary: 'Update Tribunal decision',
    description: 'Update Tribunal decision'
  },
  LIST_CMA: {
    id: 'listCma',
    summary: 'Cma has been listed.',
    description: 'Cma has been listed.'
  },
  END_APPEAL: {
    id: 'endAppeal',
    summary: 'End appeal',
    description: 'End appeal'
  },
  END_APPEAL_AUTOMATICALLY: {
    id: 'endAppealAutomatically',
    summary: 'End appeal automatically',
    description: 'End appeal automatically'
  },
  RECORD_OUT_OF_TIME_DECISION: {
    id: 'recordOutOfTimeDecision',
    summary: 'Record out of time decision',
    description: 'Record out of time decision'
  },
  REQUEST_RESPONSE_REVIEW: {
    id: 'requestResponseReview',
    summary: 'Review Home Office response',
    description: 'Review Home Office response'
  },
  BUILD_CASE: {
    id: 'buildCase',
    summary: 'Build your case',
    description: 'Build your case'
  },
  UPLOAD_ADDITIONAL_EVIDENCE: {
    id: 'uploadAdditionalEvidence',
    summary: 'Upload additional evidence for AIP',
    description: 'Upload additional evidence for AIP'
  },
  UPLOAD_ADDENDUM_EVIDENCE: {
    id: 'uploadAddendumEvidence',
    summary: 'Case worker Uploads addendum evidence for AIP',
    description: 'Case worker Uploads addendum evidence for AIP'
  },
  UPLOAD_ADDENDUM_EVIDENCE_ADMIN_OFFICER: {
    id: 'uploadAddendumEvidenceAdminOfficer',
    summary: 'Admin officer Uploads addendum evidence for AIP',
    description: 'Admin officer Uploads addendum evidence for AIP'
  },
  UPLOAD_ADDENDUM_EVIDENCE_LEGAL_REP: {
    id: 'uploadAddendumEvidenceLegalRep',
    summary: 'Appellant Uploads addendum evidence for AIP',
    description: 'Appellant Uploads addendum evidence for AIP'
  },
  UPLOAD_ADDENDUM_EVIDENCE_HOME_OFFICE: {
    id: 'uploadAddendumEvidenceHomeOffice',
    summary: 'Home office uploads addendum evidence for AIP',
    description: 'Home office uploads addendum evidence for AIP'
  },
  EDIT_DOCUMENTS: {
    id: 'editDocuments',
    summary: 'Edit additional evidence for AIP',
    description: 'Edit additional evidence for AIP'
  },
  REQUEST_HEARING_REQUIREMENTS_FEATURE: {
    id: 'requestHearingRequirementsFeature',
    description: 'Request Hearing Requirements'
  },
  EDIT_AIP_HEARING_REQUIREMENTS: {
    id: 'editAipHearingRequirements',
    summary: 'Save Draft Hearing Requirements AIP',
    description: 'Save Draft Hearing Requirements AIP'
  },
  SUBMIT_AIP_HEARING_REQUIREMENTS: {
    id: 'draftHearingRequirements',
    summary: 'Submit hearing requirements AIP',
    description: 'Submit hearing requirements AIP'
  },
  LIST_CASE: {
    id: 'listCase',
    summary: 'List Case AIP',
    description: 'List case AIP'
  },
  RECORD_ADJOURNMENT_DETAILS: {
    id: 'recordAdjournmentDetails',
    summary: 'Record adjournment details',
    description: 'Record adjournment details'
  },
  STITCHING_BUNDLE_COMPLETE: {
    id: 'asyncStitchingComplete',
    summary: 'Stitching bundle complete',
    description: 'Stitching bundle complete'
  },
  SEND_DECISION_AND_REASONS: {
    id: 'sendDecisionAndReasons',
    summary: 'Send decision and reasons',
    description: 'Send decision and reasons'
  },
  PIP_ACTIVATION: {
    id: 'pipActivation',
    summary: 'PiP Activation',
    description: 'Appellant is now representing themselves'
  },
  CREATE_CASE_SUMMARY: {
    id: 'createCaseSummary',
    summary: 'Create case summary',
    description: 'Create case summary'
  },
  APPLY_FOR_FTPA_APPELLANT: {
    id: 'applyForFTPAAppellant',
    summary: 'Apply for FTPA Appellant',
    description: 'Apply for FTPA Appellant'
  },
  APPLY_FOR_FTPA_RESPONDENT: {
    id: 'applyForFTPARespondent',
    summary: 'Apply for FTPA Respondent',
    description: 'Apply for FTPA Respondent'
  },
  RESIDENT_JUDGE_FTPA_DECISION: {
    id: 'residentJudgeFtpaDecision',
    summary: 'Resident Judge FTPA decision',
    description: 'Resident Judge FTPA decision'
  },
  LEADERSHIP_JUDGE_FTPA_DECISION: {
    id: 'leadershipJudgeFtpaDecision',
    summary: 'Leadership Judge FTPA decision',
    description: 'Leadership Judge FTPA decision'
  },
  DECISION_WITHOUT_HEARING: {
    id: 'decisionWithoutHearing',
    summary: 'Decision without a hearing',
    description: 'Decision without a hearing'
  },
  MARK_AS_READY_FOR_UT_TRANSFER: {
    id: 'markAsReadyForUtTransfer',
    summary: 'Transfer appeal to Upper Tribunal',
    description: 'Transfer appeal to Upper Tribunal'
  },
  DECIDE_FTPA_APPLICATION: {
    id: 'decideFtpaApplication',
    summary: 'Decide FTPA application',
    description: 'Decide FTPA application'
  },
  REQUEST_FEE_REMISSION: {
    id: 'requestFeeRemission',
    description: 'Request fee remission'
  },
  RECORD_REMISSION_DECISION: {
    id: 'recordRemissionDecision',
    description: 'Record remission decision'
  },
  MANAGE_A_FEE_UPDATE: {
    id: 'manageFeeUpdate',
    summary: 'Manage a fee update',
    description: 'Manage a fee update'
  },
  MARK_APPEAL_AS_REMITTED: {
    id: 'markAppealAsRemitted',
    summary: 'Mark appeal as remitted',
    description: 'Mark appeal as remitted'
  },
  MARK_APPEAL_PAID: {
    id: 'markAppealPaid',
    summary: 'Mark appeal as paid',
    description: 'Make a paid'
  }
};
