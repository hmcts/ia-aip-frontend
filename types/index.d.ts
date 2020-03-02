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

interface Evidences {
  [key: string]: Evidence;
}

interface Evidence {
  id?: string;
  url: string;
  name: string;
}

interface DocumentUploadResponse {
  id: string;
  url: string;
  name: string;
}

interface Appeal {
  appealStatus?: string;
  appealCreatedDate?: string;
  appealLastModified?: string;
  application: AppealApplication;
  reasonsForAppeal: ReasonsForAppeal;
  hearingRequirements: HearingRequirements;
  history?: any;
}

interface AppealDate {
  day: number;
  month: number;
  year: number;
}

interface AppealApplication {
  homeOfficeRefNumber: string;
  dateLetterSent: AppealDate;
  appealType: string;
  isAppealLate: boolean;
  lateAppeal?: {
    reason?: string;
    evidence?: Evidence;
  };
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
  evidences?: Evidences;
  isEdit?: boolean;
}

interface HearingRequirements {
  [key: string]: any;
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
