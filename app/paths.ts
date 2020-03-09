const paths = {
  index: '/',
  health: '/health',
  overview: '/appeal-overview',
  liveness: '/liveness',
  healthLiveness: '/health/liveness',
  taskList: '/about-appeal',
  login: '/login',
  logout: '/logout',
  redirectUrl: '/redirectUrl',
  start: '/start-appeal',
  confirmation: '/appeals-details-sent',
  tribunalCaseworker: '/tribunal-caseworker',
  moreHelp: '/appeal-help',
  evidenceToSupportAppeal: '/supporting-evidence',
  homeOfficeDocuments: '/home-office-documents',
  personalDetails: {
    name: '/name',
    nationality: '/nationality',
    dob: '/date-birth',
    enterPostcode: '/address',
    enterAddress: '/manual-address',
    postcodeLookup: '/select-address'
  },
  homeOffice: {
    details: '/home-office-reference-number',
    letterSent: '/date-letter-sent',
    appealLate: '/late-appeal',
    uploadEvidence: '/home-office/upload-evidence',
    deleteEvidence: '/home-office/delete-evidence'
  },
  reasonsForAppeal: {
    decision: '/case-building/home-office-decision-wrong',
    supportingEvidence: '/case-building/supporting-evidence',
    supportingEvidenceUpload: '/case-building/provide-supporting-evidence',
    supportingEvidenceUploadFile: '/case-building/reason-for-appeal/supporting-evidence/upload/file',
    supportingEvidenceDeleteFile: '/case-building/reason-for-appeal/supporting-evidence/delete/file',
    supportingEvidenceSubmit: '/case-building/reason-for-appeal/supporting-evidence/submit',
    checkAndSend: '/case-building/check-answer',
    confirmation: '/case-building/answer-sent'
  },
  caseBuilding: {
    timeline: '/case-building/timeline'
  },
  typeOfAppeal: '/appeal-type',
  contactDetails: '/contact-preferences',
  checkAndSend: '/check-answers',
  eligibility: {
    start: '/eligibility-start',
    ineligible: '/not-eligible',
    questions: '/eligibility',
    eligible: '/eligible'
  },
  footer: {
    cookies: '/cookie-policy',
    termsAndConditions: '/terms-and-conditions',
    privacyPolicy: '/privacy-policy'
  },
  detailsViewers: {
    document: '/view/document',
    homeOfficeDocuments: '/view/home-office-documents',
    appealDetails: '/appeal-details',
    reasonsForAppeal: '/appeal-reasons'
  },
  session: {
    extendSession: '/extend-session',
    sessionExpired: '/session-ended'
  }
};
export {
  paths
};
