interface Task {
  id: string;
  saved: boolean;
  complete: boolean;
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

interface Appeal {
  application: AppealApplication;
  caseBuilding: CaseBuilding;
  hearingRequirements: HearingRequirements;
}

interface AppealApplication {
  homeOfficeRefNumber: string;
  dateLetterSent: {
    day: number;
    month: number;
    year: number;
  };
  appealType: string;
  isAppealLate: boolean;
  lateAppeal?: {
    reason: string;
    evidences?: [
      {
        URL: string;
        name: string;
      }
    ]
  };
  personalDetails: {
    firstName: string;
    lastName: string;
    dob: {
      day: number;
      month: number;
      year: number;
    }
    nationality: string;
  };
  contactDetails: {
    preference: {
      email: boolean;
      textMessage: boolean;
    };
    email: string;
    phone: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      postCode: string;
      country: string;
    }
  };
}

interface CaseBuilding {
  [key: string]: any;
}

interface HearingRequirements {
  [key: string]: any;
}
