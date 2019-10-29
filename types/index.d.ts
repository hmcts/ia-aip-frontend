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
  