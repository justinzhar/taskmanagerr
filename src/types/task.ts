export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
}
