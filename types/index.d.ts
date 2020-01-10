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
  url: string;
  name: string;
  description?: string;
}

interface DocumentUploadResponse {
  id: string;
  url: string;
  name: string;
}

interface Appeal {
  application: AppealApplication;
  caseBuilding: CaseBuilding;
  hearingRequirements: HearingRequirements;
}

interface AppealDate {
  day: number;
  month: number;
  year: number;
}

interface AppealApplication {
  homeOfficeRefNumber: string;
  dateLetterSent: AppealDate;
  appealType: string | string[];
  isAppealLate: boolean;
  lateAppeal?: {
    reason?: string;
    evidences?: Evidences;
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

interface CaseBuilding {
  [key: string]: any;
  decision: string;
  evidences?: Evidence;
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
