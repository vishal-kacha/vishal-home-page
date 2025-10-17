export type Todo = {
  id: string;
  title: string;
  status: boolean;
};

export type Note = {
  id: number;
  content: string;
};

export type DailyData = {
  date: string;
  notes: Note[];
  todos: Todo[];
};

export type DatePickerProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

export type NotesProps = {
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
};

export type TodosProps = {
  todos: Todo[];
  onUpdateTodos: (todos: Todo[]) => void;
};
