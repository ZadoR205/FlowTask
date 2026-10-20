import { State } from './state';
import { User } from './user';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string; // ISO date 'YYYY-MM-DD'
  status_id: string;
  responsible_id?: string | null;
  status: State;
  responsible?: User | null;
  category_id: string;
  category_name: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  category_id: string;
  due_date: string;
  status_id?: string;
  responsible_id?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string;
  status_id?: string;
  responsible_id?: string | null;
}

export interface TaskFilterParams {
  category_id?: string;
  status_id?: string;
  responsible_id?: string;
  skip?: number;
  limit?: number;
}
