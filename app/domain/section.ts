export interface Task {
  id: string;
  saved: boolean;
  complete: boolean;
}

export interface Section {
  sectionId: string;
  tasks: [ Task ];
}
