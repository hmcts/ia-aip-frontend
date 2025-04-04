const paths = {
  appealStarted: {
    name: '/name',
    nationality: '/nationality',
    dob: '/date-birth',
    enterPostcode: '/address',
    enterAddress: '/manual-address',
    postcodeLookup: '/select-address',
    oocAddress: '/out-of-country-address',
    details: '/home-office-reference-number',
    letterSent: '/date-letter-sent',
    letterReceived: '/date-letter-received',
    homeOfficeDecisionLetter: '/home-office-upload-decision-letter',
    homeOfficeDecisionLetterUpload: '/home-office-upload-decision-letter/upload',
    homeOfficeDecisionLetterDelete: '/home-office-upload-decision-letter/delete',
    appealLate: '/late-appeal',
    uploadEvidence: '/home-office/upload-evidence',
    deleteEvidence: '/home-office/delete-evidence',
    typeOfAppeal: '/appeal-type',
    payNow: '/pay-now',
    decisionType: '/decision-type',
    feeSupport: '/fee-support',
    asylumSupport: '/asylum-support',
    feeWaiver: '/fee-waiver',
    localAuthorityLetter: '/local-authority-letter',
    localAuthorityLetterUpload: '/local-authority-letter/upload',
    localAuthorityLetterDelete: '/local-authority-letter/delete',
    helpWithFees: '/help-with-fees',
    stepsToApplyForHelpWithFees: '/steps-to-help-with-fees',
    helpWithFeesReferenceNumber: '/help-with-fees-ref-number',
    contactDetails: '/contact-preferences',
    hasSponsor: '/has-sponsor',
    sponsorName: '/sponsor-name',
    sponsorAddress: '/sponsor-address',
    sponsorContactDetails: '/sponsor-contact-preferences',
    sponsorAuthorisation: '/sponsor-authorisation',
    checkAndSend: '/check-answers',
    taskList: '/about-appeal',
    appealOutOfCountry: '/in-the-uk',
    gwfReference: '/gwf-reference',
    oocHrInside: '/ooc-hr-inside',
    oocHrEea: '/ooc-hr-eea',
    oocProtectionDepartureDate: '/ooc-protection-departure-date',
    deportationOrder: '/deportation-order'
  },
  appealSubmitted: {
    confirmation: '/appeals-details-sent',
    feeSupportRefund: '/fee-support-refund',
    asylumSupportRefund: '/asylum-support-refund',
    feeWaiverRefund: '/fee-waiver-refund',
    localAuthorityLetterRefund: '/local-authority-letter-refund',
    localAuthorityLetterUploadRefund: '/local-authority-letter-refund/upload',
    localAuthorityLetterDeleteRefund: '/local-authority-letter-refund/delete',
    helpWithFeesRefund: '/help-with-fees-refund',
    stepsToApplyForHelpWithFeesRefund: '/steps-to-help-with-fees-refund',
    helpWithFeesReferenceNumberRefund: '/help-with-fees-ref-number-refund',
    checkYourAnswersRefund: '/check-your-answers-refund',
    confirmationRefund: '/asked-for-remission'
  },
  pendingPayment: {
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
  awaitingClarifyingQuestionsAnswers: {
    questionsList: '/questions-about-appeal',
    question: '/question/:id',
    supportingEvidenceQuestion: '/clarifying-questions/supporting-evidence/:id',
    supportingEvidenceUploadFile: '/clarifying-questions/upload-evidence/:id',
    supportingEvidenceDeleteFile: '/clarifying-questions/delete-evidence/:id/',
    supportingEvidenceSubmit: '/clarifying-questions/submit/:id',
    anythingElse: '/anything-else',
    anythingElseQuestionPage: '/anything-else-question',
    anythingElseAnswerPage: '/anything-else-answer',
    checkAndSend: '/check-your-answers'
  },
  clarifyingQuestionsAnswersSubmitted: {
    confirmation: '/clarifying-questions-sent'
  },
  submitHearingRequirements: {
    taskList: '/hearing-needs',
    witnesses: '/hearing-witnesses',
    accessNeeds: '/hearing-access-needs',
    otherNeeds: '/hearing-other-needs',
    datesToAvoidQuestion: '/hearing-dates-avoid',
    checkAndSend: '/hearing-check-answers',
    hearingWitnessNames: '/hearing-witness-names',
    hearingWitnessNamesAdd: '/hearing-witness-names/add',
    hearingWitnessNamesRemove: '/hearing-witness-names/remove',
    witnessOutsideUK: '/hearing-outside-uk',
    hearingInterpreter: '/hearing-interpreter',
    hearingInterpreterSupportAppellantWitnesses: '/hearing-interpreter-support-appellant-Witnesses',
    hearingInterpreterTypes: '/hearing-interpreter-types',
    hearingInterpreterSpokenLanguageSelection: '/hearing-interpreter-spoken-language-selection',
    hearingInterpreterSignLanguageSelection: '/hearing-interpreter-sign-language-selection',
    hearingWitnessesInterpreterNeeds: '/hearing-witnesses-interpreter-needs',
    hearingLanguageDetails: '/hearing-language-details',
    hearingLanguageDetailsAdd: '/hearing-language-details/add',
    hearingLanguageDetailsRemove: '/hearing-language-details/remove',
    hearingStepFreeAccess: '/hearing-step-free-access',
    hearingLoop: '/hearing-hearing-loop',

    otherNeedsVideoAppointment: '/hearing-video-appointment',
    otherNeedsVideoAppointmentReason: '/hearing-video-appointment-reasons',
    otherNeedsMultimediaEvidenceQuestion: '/hearing-multimedia-evidence',
    otherNeedsMultimediaEquipmentQuestion: '/hearing-multimedia-evidence-equipment',
    otherNeedsMultimediaEquipmentReason: '/hearing-multimedia-evidence-equipment-reasons',

    otherNeedsSingleSexHearingQuestion: '/hearing-single-sex',
    otherNeedsSingleSexTypeHearing: '/hearing-single-sex-type',
    otherNeedsAllMaleHearing: '/hearing-single-sex-type-male',
    otherNeedsAllFemaleHearing: '/hearing-single-sex-type-female',

    otherNeedsPrivateHearingQuestion: '/hearing-private',
    otherNeedsHealthConditions: '/hearing-physical-mental-health',
    otherNeedsPastExperiences: '/hearing-past-experiences',
    otherNeedsAnythingElse: '/hearing-anything-else',
    otherNeedsPrivateHearingReason: '/hearing-private-reason',
    otherNeedsHealthConditionsReason: '/hearing-physical-mental-health-reasons',
    otherNeedsPastExperiencesReasons: '/hearing-past-experiences-reasons',
    otherNeedsAnythingElseReasons: '/hearing-anything-else-reasons',

    hearingDatesToAvoidQuestion: '/hearing-dates-avoid',
    hearingDatesToAvoidEnterDate: '/hearing-dates-avoid-enter',
    hearingDatesToAvoidEnterDateWithId: '/hearing-dates-avoid-enter/:id',
    hearingDateToAvoidReasons: '/hearing-dates-avoid-reasons',
    hearingDateToAvoidReasonsWithId: '/hearing-dates-avoid-reasons/:id',
    hearingDateToAvoidNew: '/hearing-dates-avoid-new',
    confirmation: '/hearing-success',
    yourHearingNeeds: '/your-hearing-needs',
    appellantAttendingHearing: '/appellant-attending-hearing',
    appellantOralEvidence: '/appellant-oral-evidence'
  },
  awaitingCmaRequirements: {
    taskList: '/appointment-needs',
    accessNeeds: '/appointment-access-needs',
    accessNeedsInterpreter: '/appointment-interpreter',
    accessNeedsStepFreeAccess: '/appointment-step-free-access',
    accessNeedsHearingLoop: '/appointment-hearing-loop',
    accessNeedsAdditionalLanguage: '/appointment-add-language-details',
    otherNeeds: '/appointment-other-needs',
    otherNeedsMultimediaEvidenceQuestion: '/appointment-multimedia-evidence',
    otherNeedsMultimediaEquipmentQuestion: '/appointment-multimedia-evidence-equipment',
    otherNeedsMultimediaEquipmentReason: '/appointment-multimedia-evidence-equipment-reasons',
    otherNeedsSingleSexAppointment: '/appointment-single-sex',
    otherNeedsSingleSexTypeAppointment: '/appointment-single-sex-type',
    otherNeedsAllMaleAppointment: '/appointment-single-sex-type-male',
    otherNeedsAllFemaleAppointment: '/appointment-single-sex-type-female',
    otherNeedsPrivateAppointment: '/appointment-private',
    otherNeedsPrivateAppointmentReason: '/appointment-private-reasons',
    otherNeedsHealthConditions: '/appointment-physical-mental-health',
    otherNeedsHealthConditionsReason: '/appointment-physical-mental-health-reasons',
    otherNeedsPastExperiences: '/appointment-past-experiences',
    otherNeedsPastExperiencesReasons: '/appointment-past-experiences-reasons',
    otherNeedsAnythingElse: '/appointment-anything-else',
    otherNeedsAnythingElseReasons: '/appointment-anything-else-reasons',
    datesToAvoidQuestion: '/appointment-dates-avoid',
    datesToAvoidEnterDate: '/appointment-dates-avoid-enter',
    datesToAvoidEnterDateWithId: '/appointment-dates-avoid-enter/:id',
    datesToAvoidReason: '/appointment-dates-avoid-reasons',
    datesToAvoidReasonWithId: '/appointment-dates-avoid-reasons/:id',
    datesToAvoidAddAnotherDate: '/appointment-dates-avoid-new',
    checkAndSend: '/appointment-check-answers'
  },
  cmaRequirementsSubmitted: {
    confirmation: '/appointment-success'
  },
  ftpa: {
    ftpaApplication: '/apply-for-ftpa',
    ftpaReason: '/ftpa-reason',
    ftpaEvidenceQuestion: '/ftpa-evidence-question',
    ftpaEvidence: '/ftpa-evidence',
    ftpaCheckAndSend: '/ftpa-check-answers',
    ftpaOutOfTimeReason: '/ftpa-out-of-time-reason',
    ftpaOutOfTimeEvidenceQuestion: '/ftpa-out-of-time-evidence-question',
    ftpaOutOfTimeEvidence: '/ftpa-out-of-time-evidence',
    ftpaOutOfTimeEvidenceUploadFile: '/ftpa-out-of-time-evidence/upload/file',
    ftpaOutOfTimeEvidenceDeleteFile: '/ftpa-out-of-time-evidence/delete/file',
    ftpaEvidenceUploadFile: '/ftpa-evidence/upload/file',
    ftpaEvidenceDeleteFile: '/ftpa-evidence/delete/file',
    ftpaConfirmation: '/ftpa-confirmation'
  },
  // Start Representing Yourself
  startRepresentingYourself: {
    start: '/start-representing-yourself',
    enterCaseNumber: '/start-representing-yourself/enter-case-number',
    enterSecurityCode: '/start-representing-yourself/enter-security-code',
    confirmDetails: '/start-representing-yourself/confirm-case-details'
  },
  common: {
    // index, start, idam endpoints and overview
    index: '/',
    login: '/login',
    logout: '/logout',
    redirectUrl: '/redirectUrl',
    start: '/start-appeal',
    overview: '/appeal-overview',
    fileNotFound: '/file-not-found',
    yourCQanswers: '/your-answers/:id',

    // Health endpoints
    health: '/health',
    liveness: '/liveness',
    healthLiveness: '/health/liveness',
    healthReadiness: '/health/readiness',

    // Eligibility Questions endpoints
    ineligible: '/not-eligible',
    questions: '/eligibility',
    eligible: '/eligible',

    provideMoreEvidenceForm: '/provide-more-evidence',
    provideMoreEvidenceUploadFile: '/provide-more-evidence/upload/file',
    provideMoreEvidenceDeleteFile: '/provide-more-evidence/delete/file',
    provideMoreEvidenceCheck: '/provide-more-evidence-check',
    provideMoreEvidenceConfirmation: '/provide-more-evidence-sent',
    yourEvidence: '/your-evidence',
    yourAddendumEvidence: '/your-evidence/addendum',
    lrEvidence: '/lr/your-evidence',
    homeOfficeAddendumEvidence: '/home-office-evidence/addendum',
    newEvidence: '/new-evidence',
    whyEvidenceLate: '/why-evidence-late',

    // Viewers endpoints
    documentViewer: '/view/document',
    homeOfficeDocumentsViewer: '/view/home-office-documents',
    appealDetailsViewer: '/appeal-details',
    reasonsForAppealViewer: '/appeal-reasons',
    lrReasonsForAppealViewer: '/lr/appeal-reasons',
    makeAnApplicationViewer: '/view/make-an-application',
    timeExtensionDecisionViewer: '/view/time-extension-decision',
    cmaRequirementsAnswerViewer: '/your-appointment-needs',
    noticeEndedAppealViewer: '/notice-ended-appeal',
    outOfTimeDecisionViewer: '/out-of-time-decision',
    homeOfficeWithdrawLetter: '/home-office-withdrawal-letter',
    homeOfficeResponse: '/home-office-response',
    hearingNoticeViewer: '/hearing-notice/:id',
    latestHearingNoticeViewer: '/hearing-notice/latest',
    hearingAdjournmentNoticeViewer: '/hearing-adjournment-notice',
    hearingBundleViewer: '/hearing-bundle',
    decisionAndReasonsViewer: '/decision-reasons',
    decisionAndReasonsViewerWithRule32: '/decision-reasons-with-rule32',
    ftpaAppellantApplicationViewer: '/ftpa-appellant-application',
    ftpaDecisionViewer: '/ftpa-decision',
    directionHistoryViewer: '/direction-history/:id',
    updatedDecisionAndReasonsViewer: '/updated-decision-reasons',
    remittalDocumentsViewer: '/remittal-documents',

    // Ask for more time
    askForMoreTimeReason: '/ask-for-more-time',
    askForMoreTimeCancel: '/ask-for-more-time-cancel',
    askForMoreTimeSupportingEvidence: '/supporting-evidence-more-time',
    askForMoreTimeSupportingEvidenceUpload: '/provide-supporting-evidence-more-time',
    askForMoreTimeSupportingEvidenceSubmit: '/provide-supporting-evidence-more-time-submit',
    askForMoreTimeSupportingEvidenceDelete: '/provide-supporting-evidence-more-time-delete',
    askForMoreTimeCheckAndSend: '/check-answer-more-time',
    askForMoreTimeConfirmation: '/request-more-time-sent',

    // Payments
    finishPayment: '/finish-payment',
    payLater: '/pay-later',
    payImmediately: '/pay-immediately',
    confirmationPayment: '/confirmation-payment',

    // Change Representation
    changeRepresentation: '/change-representation',
    changeRepresentationDownload: '/change-representation-download',

    // Session extension
    extendSession: '/extend-session',
    sessionExpired: '/session-ended',

    // Forbidden page endpoint
    forbidden: '/forbidden',

    // Guidance pages endpoints
    tribunalCaseworker: '/tribunal-caseworker',
    moreHelp: '/appeal-help',
    evidenceToSupportAppeal: '/supporting-evidence',
    whatIsIt: '/supporters-guidance/what-service-who',
    gettingStarted: '/supporters-guidance/getting-started',
    documents: '/supporters-guidance/documents',
    fourStages: '/supporters-guidance/four-stages-process',
    giveFeedback: '/supporters-guidance/how-give-feedback',
    notifications: '/supporters-guidance/notifications',
    howToHelp: '/supporters-guidance/how-get-help',
    guidance: '/supporters-guidance/guidance',
    offlineProcesses: '/supporters-guidance/offline-processes',
    homeOfficeDocuments: '/home-office-documents',
    whatToExpectAtCMA: '/expect-case-management-appointment',
    whatToExpectAtHearing: '/expect-hearing',
    understandingHearingBundle: '/understanding-hearing-bundle',
    homeOfficeMaintainDecision: '/home-office-maintain',
    homeOfficeWithdrawDecision: '/home-office-withdraw',
    clarifyingQuestionsAnswersSentConfirmation: '/clarifying-questions-sent',

    // Footer links
    cookies: '/cookie-policy',
    termsAndConditions: '/terms-and-conditions',
    privacyPolicy: '/privacy-policy',
    accessibility: '/accessibility-statement'
  },
  makeApplication: {
    // Hearing requests
    askChangeHearing: '/ask-change-hearing',
    expedite: '/ask-hearing-sooner',
    adjourn: '/ask-change-date',
    transfer: '/ask-change-location',
    updateHearingRequirements: '/ask-update-hearing-requirements',
    withdraw: '/ask-withdraw',
    updateAppealDetails: '/ask-update-details',
    linkOrUnlink: '/ask-link-unlink',
    judgesReview: '/ask-judge-review',
    other: '/ask-something-else',
    reinstate: '/ask-reinstate',
    changeHearingType: '/ask-change-hearing-type',
    supportingEvidenceExpedite: '/supporting-evidence-hearing-sooner',
    supportingEvidenceAdjourn: '/supporting-evidence-hearing-later',
    supportingEvidenceTransfer: '/supporting-evidence-change-location',
    supportingEvidenceWithdraw: '/supporting-evidence-withdraw',
    supportingEvidenceUpdateAppealDetails: '/supporting-evidence-update-details',
    supportingEvidenceOther: '/supporting-evidence-something-else',
    supportingEvidenceUpdateHearingRequirements: '/supporting-evidence-update-hearing-requirements',
    supportingEvidenceLinkOrUnlink: '/supporting-evidence-link-unlink',
    supportingEvidenceJudgesReview: '/supporting-evidence-judge-review',
    supportingEvidenceReinstate: '/supporting-evidence-reinstate',
    supportingEvidenceChangeHearingType: '/supporting-evidence-change-hearing-type',
    provideSupportingEvidenceExpedite: '/provide-supporting-evidence-hearing-sooner',
    provideSupportingEvidenceAdjourn: '/provide-supporting-evidence-hearing-later',
    provideSupportingEvidenceTransfer: '/provide-supporting-evidence-change-location',
    provideSupportingEvidenceWithdraw: '/provide-supporting-evidence-withdraw',
    provideSupportingEvidenceUpdateAppealDetails: '/provide-supporting-update-details',
    provideSupportingEvidenceOther: '/provide-supporting-evidence-something-else',
    provideSupportingEvidenceUpdateHearingRequirements: '/provide-supporting-evidence-update-hearing-requirements',
    provideSupportingEvidenceLinkOrUnlink: '/provide-supporting-evidence-link-unlink',
    provideSupportingEvidenceJudgesReview: '/provide-supporting-evidence-judge-review',
    provideSupportingEvidenceReinstate: '/provide-supporting-evidence-reinstate',
    provideSupportingEvidenceUploadFile: '/provide-supporting-evidence/upload/file',
    provideSupportingEvidenceDeleteFile: '/provide-supporting-evidence/delete/file',
    provideSupportingEvidenceChangeHearingType: '/provide-supporting-evidence-change-hearing-type',
    checkAnswerExpedite: '/check-answer-hearing-sooner',
    checkAnswerAdjourn: '/check-answer-hearing-later',
    checkAnswerTransfer: '/check-answer-change-location',
    checkAnswerWithdraw: '/check-answer-withdraw',
    checkAnswerUpdateAppealDetails: '/check-answer-update-details',
    checkAnswerOther: '/check-answer-something-else',
    checkAnswerUpdateHearingRequirements: '/check-answer-update-hearing-requirements',
    checkAnswerLinkOrUnlink: '/check-answer-link-unlink',
    checkAnswerJudgesReview: '/check-answer-judge-review',
    checkAnswerReinstate: '/check-answer-reinstate',
    checkAnswerChangeHearingType: '/check-answer-change-hearing-type',
    requestSent: '/request-sent',
    yourRequest: '/your-request'
  }
};
export {
  paths
};
