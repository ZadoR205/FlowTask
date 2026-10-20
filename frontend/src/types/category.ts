import { State } from './state';
import { Collaborator } from './collaborator';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface CategoryDetail extends Category {
  states: State[];
  collaborators: Collaborator[];
}
