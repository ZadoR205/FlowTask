import { User } from './user';

export interface Collaborator {
  id: string;
  user_id: string;
  category_id: string;
  ownership: boolean;
  user?: User;
}

export interface CollaboratorAdd {
  email: string;
}
