const paths = {
  index: '/',
  health: '/health',
  liveness: '/liveness',
  healthLiveness: '/health/liveness',
  taskList: '/task-list',
  login: '/login',
  logout: '/logout',
  redirectUrl: '/redirectUrl',
  start: '/start',
  confirmation: '/confirmation',
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
    deleteEvidence: '/home-office/delete-evidence'
  },
  reasonsForAppeal: {
    decision: '/reasons/reason-for-appeal',
    uplaod: '/reasons/reason-for-appeal-upload',
    deleteReason: '/reasons/delete-reason-for-appeal-upload',
    confirmation: '/reasons/confirmation',
    fileUpload: '/reason-for-appeal-upload'
  },
  typeOfAppeal: '/type-of-appeal',
  contactDetails: '/contact-details',
  checkAndSend: '/check-and-send',
  eligibility: {
    ineligible: '/ineligible',
    questions: '/eligibility',
    eligible: '/eligible'
  }
};

export {
  paths
};
