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
  homeOfficeDecisionDate: string;
  appellantGivenNames: string;
  appellantFamilyName: string;
  appellantDateOfBirth: string;
  appellantNationalities: Nationality[];
  appellantAddress: CCDAddress;
  appellantHasFixedAddress: 'Yes' | 'No';
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
  directions: Collection<DirectionValue>[];
  draftClarifyingQuestionsAnswers: ClarifyingQuestion<Collection<SupportingDocument>>[];
  interpreterLanguage?: Collection<AdditionalLanguage>[];
  isInterpreterServicesNeeded?: string;
  isHearingRoomNeeded?: string;
  isHearingLoopNeeded?: string;
  submitTimeExtensionReason?: string;
  submitTimeExtensionEvidence?: TimeExtensionEvidenceCollection[];
  clarifyingQuestionsAnswers: ClarifyingQuestion<Collection<SupportingDocument>>[];
}

interface Collection<T> {
  id?: string | number;
  value: T;
}

interface Nationality {
  id?: string;
  value: {
    code: string;
  };
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
