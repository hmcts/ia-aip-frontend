interface Task {
  id: string;
  saved: boolean;
  complete: boolean;
}
  
interface Section {
  sectionId: string;
  tasks: Task[];
}
  