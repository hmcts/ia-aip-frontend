interface Href {
  href: string;
  text: string;
  visuallyHiddenText?: string;
}

interface SummarySection {
  title?: string;
  summaryLists: SummaryList[];
}

interface SummaryList {
  title?: string;
  summaryRows: SummaryRow[];
}

interface SummaryRow {
  classes?: string;
  key: {
    text: string
  };
  value: {
    html: string
  };
  actions?: {
    items: Href[]
  };
}

interface Task {
  id?: string;
  saved: boolean;
  completed: boolean;
  active: boolean;
}

interface Section {
  sectionId: string;
  tasks: Task[];
}

interface ValidationError {
  key: string;
  text: string;
  href: string;
}

interface ValidationErrors {
  [key: string]: ValidationError;
}

interface DocumentMap {
  id: string;
  url: string;
}

interface TimeExtensionEventMap {
  id: string;
  externalId: string;
  historyData: HistoryEvent;
}

interface Evidence {
  id?: string;
  fileId: string;
  name: string;
  tag?: string;
  suppliedBy?: string;
  description?: string;
  dateUploaded?: string;
  dateTimeUploaded?: string;
  uploadedBy?: string;
}

interface AdditionalEvidenceDocument {
  name: string;
  fileId: string;
  description?: string;
}

interface AdditionalEvidence {
  id?: string;
  value: {
    tag: string;
    suppliedBy?: string;
    uploadedBy?: string;
    document?: SupportingDocument;
    description?: string;
    dateUploaded?: string;
  };
}

interface DocumentUploadResponse {
  fileId: string;
  name: string;
}

interface Value {
  code: string;
  label: string;
}

interface MakeAnApplicationTypes {
  value: Value;
  list_items?: Value[];
}

interface Appeal {
  ccdCaseId?: string;
  appealStatus?: string;
  appealCreatedDate?: string;
  appealLastModified?: string;
  appealReferenceNumber?: string;
  ccdReferenceNumber?: string;
  removeAppealFromOnlineReason?: string;
  removeAppealFromOnlineDate?: string;
  application: AppealApplication;
  reasonsForAppeal?: ReasonsForAppeal;
  hearingRequirements?: HearingRequirements;
  respondentDocuments?: Evidence[];
  hearingDocuments?: Evidence[];
  reheardHearingDocuments?: Evidence[];
  cmaRequirements?: CmaRequirements;
  documentMap?: DocumentMap[];
  history?: HistoryEvent[];
  askForMoreTime?: AskForMoreTime;
  timeExtensions?: TimeExtension[];
  timeExtensionEventsMap?: TimeExtensionEventMap[];
  directions?: Direction[];
  draftClarifyingQuestionsAnswers?: ClarifyingQuestion<Evidence>[];
  clarifyingQuestionsAnswers?: ClarifyingQuestion<Evidence>[];
  reheardHearingDocumentsCollection?: ReheardHearingDocs<Evidence>[];
  hearing?: Hearing;
  legalRepresentativeDocuments?: Evidence[];
  tribunalDocuments?: Evidence[];
  finalDecisionAndReasonsDocuments?: Evidence[];
  hearingCentre?: string;
  outOfTimeDecisionType?: string;
  outOfTimeDecisionMaker?: string;
  makeAnApplicationProvideEvidence?: string;
  makeAnApplicationTypes?: MakeAnApplicationTypes;
  makeAnApplicationDetails?: string;
  makeAnApplicationEvidence?: Evidence[];
  makeAnApplications?: Collection<Application<Evidence>>[];
  appealReviewDecisionTitle?: any;
  appealReviewOutcome?: string;
  homeOfficeAppealResponseDocument?: any;
  homeOfficeAppealResponseDescription?: string;
  homeOfficeAppealResponseEvidence?: any;
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
  newFeeAmount?: string;
  previousFeeAmountGbp?: string;
  additionalEvidenceDocuments?: Evidence[];
  addendumEvidenceDocuments?: Evidence[];
  additionalEvidence?: AdditionalEvidenceDocument[];
  addendumEvidence?: AdditionalEvidenceDocument[];
  pcqId?: string;
  isDecisionAllowed?: string;
  updateTribunalDecisionList?: string;
  updatedAppealDecision?: string;
  typesOfUpdateTribunalDecision?: DynamicList;
  updateTribunalDecisionAndReasonsFinalCheck?: string;
  rule32NoticeDocs?: Evidence;
  appealOutOfCountry?: string;
  ftpaApplicantType?: string;
  ftpaAppellantEvidenceDocuments?: Evidence[];
  ftpaAppellantDocuments?: Evidence[];
  ftpaAppellantGrounds?: string;
  ftpaProvideEvidence?: 'Yes' | 'No';
  ftpaAppellantSubmissionOutOfTime?: 'Yes' | 'No';
  ftpaAppellantOutOfTimeExplanation?: string;
  ftpaOutOfTimeProvideEvidence?: 'Yes' | 'No';
  ftpaAppellantOutOfTimeDocuments?: Evidence[];
  ftpaAppellantApplicationDate?: string;
  ftpaRespondentEvidenceDocuments?: Evidence[];
  ftpaRespondentGroundsDocuments?: Evidence[];
  ftpaRespondentOutOfTimeExplanation?: string;
  ftpaRespondentOutOfTimeDocuments?: Evidence[];
  ftpaRespondentApplicationDate?: string;
  ftpaRespondentDecisionOutcomeType?: string;
  ftpaRespondentDecisionDocument?: Evidence[];
  ftpaRespondentDecisionDate?: string;
  ftpaRespondentRjDecisionOutcomeType?: string;
  ftpaAppellantRjDecisionOutcomeType?: string;
  ftpaAppellantDecisionOutcomeType?: string;
  ftpaAppellantDecisionDocument?: Evidence[];
  ftpaAppellantDecisionDate?: string;
  nonStandardDirectionEnabled?: boolean;
  readonlyApplicationEnabled?: boolean;
  utAppealReferenceNumber?: string;
  ftpaR35AppellantDocument?: Evidence;
  ftpaR35RespondentDocument?: Evidence;
  ftpaApplicationRespondentDocument?: Evidence;
  ftpaApplicationAppellantDocument?: Evidence;
  ftpaAppellantDecisionRemadeRule32Text?: string;
  ftpaRespondentDecisionRemadeRule32Text?: string;
  updatedDecisionAndReasons?: DecisionAndReasons[];
  sourceOfRemittal?: string;
  remittalDocuments?: RemittalDetails[];
}

interface Hearing {
  hearingCentre: string;
  time: string;
  date: string;
}

interface AskForMoreTime {
  inFlight?: boolean;
  reason?: string;
  evidence?: Evidence[];
  reviewTimeExtensionRequired?: 'Yes' | 'No';
}

interface HistoryEvent {
  id: string;
  event: {
    eventName: string;
    description: string;
  };
  user: {
    id: string;
    lastName: string;
    firstName: string;
  };
  createdDate: string;
  caseTypeVersion: number;
  state: {
    id: string;
    name: string;
  };
  data: any;
}

interface AppealDate {
  day: string;
  month: string;
  year: string;
}

interface LateAppeal {
  reason: string;
  evidence?: Evidence;
}

interface AppealApplication {
  homeOfficeRefNumber: string;
  appellantInUk: string;
  gwfReferenceNumber: string;
  outsideUkWhenApplicationMade?: string;
  dateClientLeaveUk: AppealDate;
  dateLetterSent: AppealDate;
  decisionLetterReceivedDate: AppealDate;
  homeOfficeLetter?: Evidence[];
  appealType: string;
  isAppealLate: boolean;
  lateAppeal?: LateAppeal;
  personalDetails: {
    givenNames: string;
    familyName: string;
    dob: AppealDate;
    nationality?: string;
    stateless?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postcode?: string;
      county?: string;
    }
  };
  appellantOutOfCountryAddress?: string;
  contactDetails: {
    email?: string;
    wantsEmail?: boolean;
    phone?: string;
    wantsSms?: boolean;
  };
  hasSponsor?: string;
  sponsorGivenNames?: string;
  sponsorFamilyName?: string;
  sponsorNameForDisplay?: string;
  sponsorAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
    county?: string;
  };
  sponsorContactDetails?: {
    email?: string;
    wantsEmail?: boolean;
    phone?: string;
    wantsSms?: boolean;
  };
  sponsorAuthorisation?: string;
  tasks?: {
    [key: string]: Task;
  };
  addressLookup?: {
    result?: any;
  };
  isEdit?: boolean;
  saveAndAskForTime?: boolean;
  rpDcAppealHearingOption?: string;
  decisionHearingFeeOption?: string;
  feeSupportPersisted?: boolean;
  remissionOption?: string;
  asylumSupportRefNumber?: string;
  helpWithFeesOption?: string;
  helpWithFeesRefNumber?: string;
  localAuthorityLetters?: Evidence[];

  lateRemissionOption?: string;
  lateAsylumSupportRefNumber?: string;
  lateHelpWithFeesOption?: string;
  lateHelpWithFeesRefNumber?: string;
  lateLocalAuthorityLetters?: Evidence[];

  refundRequested?: boolean;
  remissionDecision?: string;
  amountLeftToPay?: string;
  remissionDecisionReason?: string;
  previousRemissionDetails?: RemissionDetails[];
  remissionRejectedDatePlus14days?: string;
  isLateRemissionRequest?: boolean;
  feeUpdateTribunalAction?: string;
  feeUpdateReason?: string;
  manageFeeRefundedAmount?: string;
  manageFeeRequestedAmount?: string;
  paidAmount?: string;
  refundConfirmationApplied?: boolean;
  deportationOrderOptions?: string;
}

interface CmaRequirements {
  isEdit?: boolean;
  tasks?: {
    [key: string]: Task;
  };
  accessNeeds?: AccessNeeds;
  otherNeeds?: OtherNeeds;
  datesToAvoid?: DatesToAvoid;
}

interface AccessNeeds {
  isInterpreterServicesNeeded?: boolean;
  interpreterLanguage?: AdditionalLanguage;
  isHearingRoomNeeded?: boolean;
  isHearingLoopNeeded?: boolean;
}

interface OtherNeeds {
  multimediaEvidence?: boolean;
  bringOwnMultimediaEquipment?: boolean;
  bringOwnMultimediaEquipmentReason?: string;
  singleSexAppointment?: boolean;
  singleSexTypeAppointment?: 'All female' | 'All male';
  singleSexAppointmentReason?: string;
  privateAppointment?: boolean;
  privateAppointmentReason?: string;
  healthConditions?: boolean;
  healthConditionsReason?: string;
  pastExperiences?: boolean;
  pastExperiencesReason?: string;
  anythingElse?: boolean;
  anythingElseReason?: string;
}

interface HearingOtherNeeds extends OtherNeeds {
  remoteVideoCall?: boolean;
  remoteVideoCallDescription?: string;
}

interface DatesToAvoid {
  isDateCannotAttend: boolean;
  dates?: CmaDateToAvoid[];
}

// the same interface is used for hearingDate to avoid as well
interface CmaDateToAvoid {
  date: AppealDate;
  reason?: string;
}

interface ReasonsForAppeal {
  applicationReason: string;
  uploadDate?: string;
  evidences?: Evidence[];
  isEdit?: boolean;
}

interface HearingRequirements {
  witnessesOnHearing?: boolean;
  isAppellantAttendingTheHearing?: boolean;
  isAppellantGivingOralEvidence?: boolean;
  witnessNames?: WitnessName[];
  witness1?: WitnessDetails;
  witness2?: WitnessDetails;
  witness3?: WitnessDetails;
  witness4?: WitnessDetails;
  witness5?: WitnessDetails;
  witness6?: WitnessDetails;
  witness7?: WitnessDetails;
  witness8?: WitnessDetails;
  witness9?: WitnessDetails;
  witness10?: WitnessDetails;
  witnessListElement1?: DynamicMultiSelectList;
  witnessListElement2?: DynamicMultiSelectList;
  witnessListElement3?: DynamicMultiSelectList;
  witnessListElement4?: DynamicMultiSelectList;
  witnessListElement5?: DynamicMultiSelectList;
  witnessListElement6?: DynamicMultiSelectList;
  witnessListElement7?: DynamicMultiSelectList;
  witnessListElement8?: DynamicMultiSelectList;
  witnessListElement9?: DynamicMultiSelectList;
  witnessListElement10?: DynamicMultiSelectList;
  witness1InterpreterLanguageCategory?: string[];
  witness2InterpreterLanguageCategory?: string[];
  witness3InterpreterLanguageCategory?: string[];
  witness4InterpreterLanguageCategory?: string[];
  witness5InterpreterLanguageCategory?: string[];
  witness6InterpreterLanguageCategory?: string[];
  witness7InterpreterLanguageCategory?: string[];
  witness8InterpreterLanguageCategory?: string[];
  witness9InterpreterLanguageCategory?: string[];
  witness10InterpreterLanguageCategory?: string[];
  witness1InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness2InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness3InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness4InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness5InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness6InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness7InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness8InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness9InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness10InterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witness1InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness2InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness3InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness4InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness5InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness6InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness7InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness8InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness9InterpreterSignLanguage?: InterpreterLanguageRefData;
  witness10InterpreterSignLanguage?: InterpreterLanguageRefData;
  witnessesOutsideUK?: boolean;
  isInterpreterServicesNeeded?: boolean;
  isAnyWitnessInterpreterRequired?: boolean;
  appellantInterpreterLanguageCategory?: string[];
  appellantInterpreterSpokenLanguage?: InterpreterLanguageRefData;
  appellantInterpreterSignLanguage?: InterpreterLanguageRefData;
  isHearingRoomNeeded?: boolean;
  isHearingLoopNeeded?: boolean;
  otherNeeds?: HearingOtherNeeds;
  [key: string]: any;
  isEdit?: boolean;
  tasks?: {
    [key: string]: Task;
  };
  datesToAvoid?: DatesToAvoid;
  // [key: string]: any;
}

interface RespondentDocument {
  dateUploaded: string;
  evidence: Evidence;
}

interface AppealType {
  value: string;
  name: string;
  title: string;
  examples: string;
  checked?: boolean;
}

interface IdamDetails {
  uid: string;
  name: string;
  given_name: string;
  family_name: string;
  sub: string;
}

interface TimeExtension {
  id: string;
  date: string;
  type: string;
  state: string;
  details: string;
  decision: string;
  evidence: Evidence[];
  applicant: string;
  applicantRole: string;
}

interface Direction {
  id: string;
  tag: string;
  parties: string;
  dateDue: string;
  dateSent: string;
  explanation: string;
  uniqueId: string;
  clarifyingQuestions?: ClarifyingQuestion;
  directionType?: string;
}

interface ClarifyingQuestion<T> {
  id?: string;
  value: {
    dateSent?: string;
    dueDate?: string;
    question: string;
    dateResponded?: string;
    answer?: string;
    directionId: string;
    supportingEvidence?: T[];
  };
}

interface ReheardHearingDocs<T> {
  id?: string;
  value: {
    reheardHearingDocs?: T[];
  };
}

interface AdditionalLanguage {
  language?: string;
  languageDialect?: string;
}
type Middleware = (req: Express.Request, res: Express.Response, next: any) => void;

interface ApplicationStatus {
  [key: string]: Task;
}

interface DecisionAndReasons {
  id: string;
  updatedDecisionDate: string;
  dateCoverLetterDocumentUploaded: string;
  coverLetterDocument: Evidence;
  dateDocumentAndReasonsDocumentUploaded?: string;
  documentAndReasonsDocument?: Evidence;
  summariseChanges?: string;
}

interface RemissionDetails {
  id?: string;
  feeAmount?: string;
  amountRemitted?: string;
  amountLeftToPay?: string;
  feeRemissionType?: string;
  remissionDecision?: string;
  asylumSupportReference?: string;
  remissionDecisionReason?: string;
  helpWithFeesReferenceNumber?: string;
  helpWithFeesOption?: string;
  localAuthorityLetters?: Evidence[];
}

interface RemittalDetails {
  id: string;
  decisionDocument: Evidence;
  otherRemittalDocs?: Evidence[];
}

interface WitnessName {
  witnessPartyId?: string;
  witnessGivenNames?: string;
  witnessFamilyName?: string;
}

interface WitnessComponent {
  witnessFullName?:string;
  witnessFieldString?: string;
  witness: WitnessDetails;
  witnessListElementFieldString?: string;
  witnessListElement?: DynamicMultiSelectList;
  witnessInterpreterLanguageCategoryFieldString?: string;
  witnessInterpreterLanguageCategory?: string[];
  witnessInterpreterSpokenLanguageFieldString? : string;
  witnessInterpreterSpokenLanguage?: InterpreterLanguageRefData;
  witnessInterpreterSignLanguageFieldString?: string;
  witnessInterpreterSignLanguage?: InterpreterLanguageRefData;
  witnessNumnber?: string;
}

interface SpokenSignLanguageConfig {
  pageTitle?: AppellantWitnessConfigValue;
  pageText?: AppellantWitnessConfigValue;
  interpreterSpokenSignLanguageFieldString?: AppellantWitnessConfigValue;
  commonRefDataType?: string;
  formAction?: string;
  dropdownListText?: string;
  checkBoxText?: string;
  languageManuallyText?: string;
}

interface AppellantWitnessConfigValue {
  witnessValue?: string;
  appellantValue: string;
}

declare module NodeJS {
  interface Global {
    testFailed: boolean;
  }
}
