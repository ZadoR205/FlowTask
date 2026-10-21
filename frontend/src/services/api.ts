import {
  User,
  UserCreate,
  LoginResponse,
  Category,
  CategoryCreate,
  CategoryDetail,
  State,
  StateCreate,
  Collaborator,
  CollaboratorAdd,
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilterParams,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = 'ApiError';
  }
}

let currentUserId: string | null = null;

export const setApiUserId = (userId: string | null) => {
  currentUserId = userId;
  if (userId) {
    localStorage.setItem('flowtask_user_id', userId);
  } else {
    localStorage.removeItem('flowtask_user_id');
  }
};

export const getStoredUserId = (): string | null => {
  if (!currentUserId) {
    currentUserId = localStorage.getItem('flowtask_user_id');
  }
  return currentUserId;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const userId = getStoredUserId();
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 8000.'
    );
  }

  if (!response.ok) {
    let errorDetail = 'Ocurrió un error inesperado';
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Validación de Pydantic
        errorDetail = errorData.detail
          .map((item: { msg?: string; loc?: string[] }) => item.msg || 'Error de validación')
          .join(', ');
      }
    } catch {
      errorDetail = response.statusText || `Error HTTP ${response.status}`;
    }

    throw new ApiError(response.status, errorDetail);
  }

  // Si la respuesta no tiene contenido (204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Autenticación
  auth: {
    login: (email: string) =>
      request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    register: (data: UserCreate) =>
      request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Usuarios
  users: {
    list: () => request<User[]>('/users'),
    getById: (id: string) => request<User>(`/users/${id}`),
  },

  // Categorías / Tableros
  categories: {
    list: (skip = 0, limit = 100) =>
      request<Category[]>(`/categories?skip=${skip}&limit=${limit}`),
    listMine: () =>
      request<Category[]>('/categories/me'),
    getDetail: (id: string) =>
      request<CategoryDetail>(`/categories/${id}`),
    create: (data: CategoryCreate) =>
      request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/categories/${id}`, {
        method: 'DELETE',
      }),
    listStates: (id: string) =>
      request<State[]>(`/categories/${id}/states`),
    listCollaborators: (id: string) =>
      request<Collaborator[]>(`/categories/${id}/collaborators`),
    addCollaborator: (id: string, data: CollaboratorAdd) =>
      request<Collaborator>(`/categories/${id}/collaborators`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Estados
  states: {
    create: (categoryId: string, data: StateCreate) =>
      request<State>(`/categories/${categoryId}/states`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (stateId: string) =>
      request<{ message: string }>(`/states/${stateId}`, {
        method: 'DELETE',
      }),
  },

  // Tareas
  tasks: {
    list: (params: TaskFilterParams = {}) => {
      const query = new URLSearchParams();
      if (params.category_id) query.append('category_id', params.category_id);
      if (params.status_id) query.append('status_id', params.status_id);
      if (params.responsible_id) query.append('responsible_id', params.responsible_id);
      if (params.skip !== undefined) query.append('skip', String(params.skip));
      if (params.limit !== undefined) query.append('limit', String(params.limit));

      const queryString = query.toString();
      return request<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) => request<Task>(`/tasks/${id}`),
    create: (data: TaskCreate) =>
      request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: TaskUpdate) =>
      request<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  // Semilla y reseteo
  seed: {
    reset: () =>
      request<{
        message: string;
        users: number;
        categories: number;
        states: number;
        tasks: number;
      }>('/seed', {
        method: 'POST',
      }),
  },
};
