interface Href {
  href: string;
  text: string;
}

interface SummaryRow {
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
  dateUploaded?: AppealDate;
  description?: string;
}

interface DocumentUploadResponse {
  fileId: string;
  name: string;
}

interface Appeal {
  appealStatus?: string;
  appealCreatedDate?: string;
  appealLastModified?: string;
  appealReferenceNumber?: string;
  application: AppealApplication;
  reasonsForAppeal: ReasonsForAppeal;
  hearingRequirements: HearingRequirements;
  respondentDocuments?: RespondentDocument[];
  documentMap?: DocumentMap[];
  history?: HistoryEvent[];
  askForMoreTime?: AskForMoreTime;
  timeExtensions?: TimeExtension[];
  timeExtensionEventsMap?: TimeExtensionEventMap[];
  directions?: Direction[];
  draftClarifyingQuestionsAnswers?: ClarifyingQuestion<Evidence>[]
}

interface AskForMoreTime {
  reason?: string;
  status?: string;
  state?: string;
  evidence?: Evidence[];
  requestDate?: string;
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
  day: number;
  month: number;
  year: number;
}

interface LateAppeal {
  reason: string;
  evidence?: Evidence;
}

interface AppealApplication {
  homeOfficeRefNumber: string;
  dateLetterSent: AppealDate;
  appealType: string;
  isAppealLate: boolean;
  lateAppeal?: LateAppeal;
  personalDetails: {
    givenNames: string;
    familyName: string;
    dob: AppealDate;
    nationality?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postcode?: string;
      county?: string;
    }
  };
  contactDetails: {
    email?: string;
    wantsEmail?: boolean;
    phone?: string;
    wantsSms?: boolean;
  };
  tasks?: {
    [key: string]: Task;
  };
  addressLookup: {
    result?: any;
  };
  isEdit?: boolean;
}

interface ReasonsForAppeal {
  applicationReason: string;
  uploadDate?: string;
  evidences?: Evidence[];
  isEdit?: boolean;
}

interface HearingRequirements {
  [key: string]: any;
}

interface RespondentDocument {
  dateUploaded: string;
  evidence: Evidence;
}

interface AppealType {
  value: string;
  title: string;
  examples: string;
  checked?: boolean;
}

interface IdamDetails {
  uid: string;
  name: string;
  given_name: string;
  family_name: string;
}

interface TimeExtension {
  requestDate: string;
  reason: string;
  state: string;
  status: string;
  evidence?: Evidence[];
  decision?: string;
  decisionReason?: string;
  decisionOutcomeDate?: string;
}

interface Direction {
  id: number;
  tag: string;
  parties: string;
  dateDue: string;
  dateSent: string;
}

interface ClarifyingQuestion<T> {
  id: string;
  value: {
    question: string;
    answer?: string;
    supportingEvidence?: T[];
  }
}

type Middleware = (req: Express.Request, res: Express.Response, next: any) => void;
