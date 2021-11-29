interface SupportingDocument {
  document_url: string;
  document_filename: string;
  document_binary_url: string;
}

interface DocumentWithMetaData {
  suppliedBy?: string;
  description?: string;
  dateUploaded?: string;
  tag?: string;
  document: SupportingDocument;
}

interface Document {
  description?: string;
  document: SupportingDocument;
}

interface CcdCaseDetails {
  id: string;
  state: string;
  case_data: CaseData;
  created_date?: string;
  last_modified?: string;
}

interface CaseData {
  journeyType: string;
  appealType: string;
  homeOfficeReferenceNumber: string;
  appealReferenceNumber: string;
  removeAppealFromOnlineReason: string;
  removeAppealFromOnlineDate: string;
  homeOfficeDecisionDate: string;
  appellantGivenNames: string;
  appellantFamilyName: string;
  appellantDateOfBirth: string;
  appellantNationalities: Nationality[];
  appellantStateless: string;
  appellantAddress: CCDAddress;
  appellantHasFixedAddress: 'Yes' | 'No';
  appellantEmailAddress: string;
  appellantPhoneNumber: string;
  subscriptions: SubscriptionCollection[];
  submissionOutOfTime: 'Yes' | 'No';
  applicationOutOfTimeExplanation: string;
  applicationOutOfTimeDocument: SupportingDocument;
  reasonsForAppealDecision: string;
  reasonsForAppealDateUploaded?: string;
  reasonsForAppealDocuments: Collection<DocumentWithMetaData>[];
  respondentDocuments: Collection<RespondentEvidenceDocument>[];
  timeExtensions: Collection<CcdTimeExtension>[];
  reviewTimeExtensionRequired?: 'Yes' | 'No';
  directions: Collection<CcdDirection>[];
  draftClarifyingQuestionsAnswers: ClarifyingQuestion<Collection<SupportingDocument>>[];
  submitTimeExtensionReason?: string;
  submitTimeExtensionEvidence?: TimeExtensionEvidenceCollection[];
  clarifyingQuestionsAnswers: ClarifyingQuestion<Collection<SupportingDocument>>[];
  isInterpreterServicesNeeded?: string;
  interpreterLanguage?: Collection<AdditionalLanguage>[];
  isHearingRoomNeeded?: string;
  isHearingLoopNeeded?: string;
  multimediaEvidence: 'Yes' | 'No';
  multimediaEvidenceDescription: string;
  singleSexCourt: 'Yes' | 'No';
  singleSexCourtType: 'All male' | 'All female';
  singleSexCourtTypeDescription: string;
  inCameraCourt: 'Yes' | 'No';
  inCameraCourtDescription: string;
  physicalOrMentalHealthIssues: 'Yes' | 'No';
  physicalOrMentalHealthIssuesDescription: string;
  pastExperiences: 'Yes' | 'No';
  pastExperiencesDescription: string;
  additionalRequests: 'Yes' | 'No';
  additionalRequestsDescription: string;
  datesToAvoidYesNo: 'Yes' | 'No';
  datesToAvoid: Collection<DateToAvoid>[];
  listCaseHearingCentre: string;
  listCaseHearingLength: string;
  listCaseHearingDate: string;
  uploadTheNoticeOfDecisionDocs: Collection<DocumentWithDescription | DocumentWithMetaData>[];
  additionalEvidence: Collection<Document>[];
  additionalEvidenceDocuments: Collection<DocumentWithDescription | DocumentWithMetaData>[];
  recordedOutOfTimeDecision: string;
  legalRepresentativeDocuments?: Collection<DocumentWithMetaData>[];
  tribunalDocuments?: Collection<DocumentWithMetaData>[];
  hearingCentre?: string;
  outOfTimeDecisionType?: string;
  outOfTimeDecisionMaker?: string;
  makeAnApplicationTypes?: any;
  makeAnApplicationDetails?: string;
  makeAnApplicationEvidence?: Collection<SupportingDocument>[];
  makeAnApplications?: Collection<Application<Collection<SupportingDocument>>>[];
  appealReviewDecisionTitle?: any;
  appealReviewOutcome?: string;
  homeOfficeAppealResponseDocument?: any;
  homeOfficeAppealResponseDescription?: string;
  homeOfficeAppealResponseEvidence?: any;
  rpDcAppealHearingOption?: string;
  decisionHearingFeeOption?: string;
  paymentReference?: string;
  paymentStatus?: string;
  paymentDate?: string;
  isFeePaymentEnabled?: string;
  paAppealTypeAipPaymentOption?: string;
  feeWithHearing?: string;
  feeWithoutHearing?: string;
  feeCode?: string;
  feeDescription?: string;
  feeVersion?: string;
  feeAmountGbp?: string;

  isWitnessesAttending?: 'Yes' | 'No';
  isEvidenceFromOutsideUkInCountry?: 'Yes' | 'No';
  witnessDetails?: Collection<WitnessDetails>[];
}

interface Application<T> {
  date: string;
  type: string;
  state: string;
  details: string;
  decision: string;
  evidence: T[];
  applicant: string;
  applicantRole: string;
  decisionDate?: string;
  decisionMaker?: string;
  decisionReason?: string;
}
interface DateToAvoid {
  dateToAvoid: string;
  dateToAvoidReason: string;
}

interface Collection<T> {
  id?: string;
  value: T;
}

interface Nationality {
  id?: string;
  value: {
    code: string;
  };
}

interface WitnessDetails {
  witnessName?: string;
}

interface CCDAddress {
  AddressLine1: string;
  AddressLine2: string;
  PostTown: string;
  County: string;
  PostCode: string;
  Country: string;
}

interface SubscriptionCollection {
  id?: number | string;
  value: Subscription;
}

interface SupportingEvidenceCollection {
  id?: number;
  value: DocumentWithMetaData;
}

interface TimeExtensionEvidenceCollection {
  id?: number;
  value: SupportingDocument;
}

interface RespondentEvidenceCollection {
  id?: number;
  value: RespondentEvidenceDocument;
}

interface TimeExtensionCollection {
  id?: number;
  value: CcdTimeExtension;
}

interface DirectionCollection {
  id?: number;
  value: CcdDirection;
}

interface PreviousDateCollection {
  id?: number;
  value: CcdPreviousDate;
}

interface CcdTimeExtension {
  requestDate?: string;
  reason: string;
  evidence?: TimeExtensionEvidenceCollection[];
  status: string;
  state: string;
  decision?: string;
  decisionReason?: string;
  decisionOutcomeDate?: string;
}

interface CcdDirection {
  tag: string;
  dateDue: string;
  parties: string;
  dateSent: string;
  explanation: string;
  previousDates?: PreviousDateCollection[];
  [key: string]: any;
}

interface CcdPreviousDate {
  dateDue: string;
  dateSent: string;
}
interface Subscription {
  subscriber: string;
  wantsEmail: 'Yes' | 'No';
  email: string;
  wantsSms: 'Yes' | 'No';
  mobileNumber: string;
}
