const editAppeal = require('./jsons/edit-appeal-in-started.json');
const submitAppeal  = require( './jsons/submit-appeal.json');
const requestHoData  = require( './jsons/request-ho-data.json');
const uploadHoBundle = require( './jsons/upload-ho-bundle.json');
const sendClarifyingQuestions = require( './jsons/send-clarifying-questions.json');
const requestRespondentEvidence = require( './jsons/request-respondent-evidence.json');
const requestReasonsForAppeal = require( './jsons/request-reasons-for-appeal.json');
const submitReasonsForAppeal = require( './jsons/submit-reasons-for-appeal.json');
const requestRespondentReview = require( './jsons/request-respondent-review.json');
const uploadHomeOfficeAppealResponse = require( './jsons/upload-ho-response.json');
const reviewHoResponse = require( './jsons/review-ho-response.json');
const requestHearingRequirements = require( './jsons/request-hearing-requirements.json');
const draftHearingRequirements = require( './jsons/draft-hearing-requirements.json');
const reviewHearingRequirements = require( './jsons/review-hearing-requirements.json');
const listCase = require( './jsons/list-case.json');
const createCaseSummary = require( './jsons/create-case-summary.json');
const generateHearingBundle = require( './jsons/generate-hearing-bundle.json');
const startDecisionAndReasons = require( './jsons/start-decision-and-reasons.json');
const prepareDecisionAndReasons = require( './jsons/prepare-decision-and-reasons.json');
const completeDecisionAndReasonsGranted = require( './jsons/complete-decision-and-reasons-granted.json');
const completeDecisionAndReasonsDismissed = require( './jsons/complete-decision-and-reasons-dismissed.json');

module.exports = {
  editAppeal,
  submitAppeal,
  requestHoData,
  uploadHoBundle,
  sendClarifyingQuestions,
  requestRespondentEvidence,
  requestReasonsForAppeal,
  submitReasonsForAppeal,
  requestRespondentReview,
  uploadHomeOfficeAppealResponse,
  reviewHoResponse,
  requestHearingRequirements,
  draftHearingRequirements,
  reviewHearingRequirements,
  listCase,
  createCaseSummary,
  generateHearingBundle,
  startDecisionAndReasons,
  prepareDecisionAndReasons,
  completeDecisionAndReasonsGranted,
  completeDecisionAndReasonsDismissed
};
