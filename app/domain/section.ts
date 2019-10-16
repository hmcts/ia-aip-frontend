interface ITask {
  id: string;
  saved: boolean;
  complete: boolean;
}

export class Task {
  constructor(public data: ITask) {
  }
}

interface ISection {
  sectionId: string;
  tasks: Task[];
}

export class Section {
  constructor(public data: ISection) {
  }
}
