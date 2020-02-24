const paths = {
  index: '/',
  health: '/health',
  overview: '/overview',
  liveness: '/liveness',
  healthLiveness: '/health/liveness',
  taskList: '/task-list',
  login: '/login',
  logout: '/logout',
  redirectUrl: '/redirectUrl',
  start: '/start',
  confirmation: '/confirmation',
  tribunalCaseworker: '/tribunal-caseworker',
  moreHelp: '/appeal-help',
  evidenceToSupportAppeal: '/supporting-evidence',
  homeOfficeDocuments: '/home-office-documents',
  personalDetails: {
    name: '/personal-details/name',
    nationality: '/personal-details/nationality',
    dob: '/personal-details/date-of-birth',
    enterPostcode: '/personal-details/enter-postcode',
    enterAddress: '/personal-details/enter-address',
    postcodeLookup: '/personal-details/postcode-lookup'
  },
  homeOffice: {
    details: '/home-office/details',
    letterSent: '/home-office/letter-sent',
    appealLate: '/home-office/appeal-late',
    uploadEvidence: '/home-office/upload-evidence',
    deleteEvidence: '/home-office/delete-evidence',
    homeOfficeDetails: '/appeal-details'
  },
  reasonsForAppeal: {
    decision: '/case-building/reason-for-appeal',
    supportingEvidence: '/case-building/reason-for-appeal/supporting-evidence',
    supportingEvidenceUpload: '/case-building/reason-for-appeal/supporting-evidence/upload',
    supportingEvidenceUploadFile: '/case-building/reason-for-appeal/supporting-evidence/upload/file',
    supportingEvidenceDeleteFile: '/case-building/reason-for-appeal/supporting-evidence/delete/file',
    supportingEvidenceSubmit: '/case-building/reason-for-appeal/supporting-evidence/submit',
    checkAndSend: '/case-building/reason-for-appeal/check-and-send',
    confirmation: '/case-building/reason-for-appeal/confirmation'
  },
  caseBuilding: {
    timeline: '/case-building/timeline'
  },
  typeOfAppeal: '/type-of-appeal',
  contactDetails: '/contact-details',
  checkAndSend: '/check-and-send',
  eligibility: {
    start: '/eligibility-start',
    ineligible: '/ineligible',
    questions: '/eligibility',
    eligible: '/eligible'
  }
};
export {
  paths
};
