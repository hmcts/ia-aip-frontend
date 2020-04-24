const paths = {
  appealStarted: {
    name: '/name',
    nationality: '/nationality',
    dob: '/date-birth',
    enterPostcode: '/address',
    enterAddress: '/manual-address',
    postcodeLookup: '/select-address',
    details: '/home-office-reference-number',
    letterSent: '/date-letter-sent',
    appealLate: '/late-appeal',
    uploadEvidence: '/home-office/upload-evidence',
    deleteEvidence: '/home-office/delete-evidence',
    typeOfAppeal: '/appeal-type',
    contactDetails: '/contact-preferences',
    checkAndSend: '/check-answers',
    taskList: '/about-appeal'
  },
  appealSubmitted: {
    confirmation: '/appeals-details-sent'
  },
  awaitingReasonsForAppeal: {
    decision: '/case-building/home-office-decision-wrong',
    supportingEvidence: '/case-building/supporting-evidence',
    supportingEvidenceUpload: '/case-building/provide-supporting-evidence',
    supportingEvidenceUploadFile: '/case-building/reason-for-appeal/supporting-evidence/upload/file',
    supportingEvidenceDeleteFile: '/case-building/reason-for-appeal/supporting-evidence/delete/file',
    supportingEvidenceSubmit: '/case-building/reason-for-appeal/supporting-evidence/submit',
    checkAndSend: '/case-building/check-answer'
  },
  reasonsForAppealSubmitted: {
    confirmation: '/case-building/answer-sent'
  },
  common: {
    // index, start, idam endpoints and overview
    index: '/',
    login: '/login',
    logout: '/logout',
    redirectUrl: '/redirectUrl',
    start: '/start-appeal',
    overview: '/appeal-overview',

    // Health endpoints
    health: '/health',
    liveness: '/liveness',
    healthLiveness: '/health/liveness',

    // Eligibility Questions endpoints
    ineligible: '/not-eligible',
    questions: '/eligibility',
    eligible: '/eligible',

    // Viewers endppoints
    documentViewer: '/view/document',
    viewHomeOfficeDocuments: '/view/home-office-documents',
    viewAppealDetails: '/appeal-details',
    viewReasonsForAppeal: '/appeal-reasons',

    // Ask for more time
    askForMoreTime: {
      reason: '/ask-for-more-time',
      cancel: '/ask-for-more-time-cancel',
      evidenceYesNo: '/supporting-evidence-more-time',
      supportingEvidenceUpload: '/provide-supporting-evidence-more-time',
      supportingEvidenceSubmit: '/provide-supporting-evidence-more-time-submit',
      supportingEvidenceDelete: '/provide-supporting-evidence-more-time-delete',
      checkAndSend: '/check-answer-more-time',
      confirmation: '/request-more-time-sent'
    },

    // Session extension
    extendSession: '/extend-session',
    sessionExpired: '/session-ended',

    // Forbidden page endpoint
    forbidden: '/forbidden',

    // Guidance pages endpoints
    tribunalCaseworker: '/tribunal-caseworker',
    moreHelp: '/appeal-help',
    evidenceToSupportAppeal: '/supporting-evidence',
    homeOfficeDocuments: '/home-office-documents',

    // Footer links
    cookies: '/cookie-policy',
    termsAndConditions: '/terms-and-conditions',
    privacyPolicy: '/privacy-policy'
  }
};
export {
  paths
};
