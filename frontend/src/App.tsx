import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { api, ApiError } from './services/api';
import {
  Category,
  CategoryDetail,
  Task,
  TaskCreate,
  TaskUpdate,
  CategoryCreate,
} from './types';
import { LoginView } from './components/auth/LoginView';
import { Navbar, ViewMode } from './components/layout/Navbar';
import { BoardBar } from './components/layout/BoardBar';
import { FilterBar } from './components/filters/FilterBar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { TaskList } from './components/list/TaskList';
import { TaskFormModal } from './components/modals/TaskFormModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { CollaboratorModal } from './components/modals/CollaboratorModal';
import { ToastContainer } from './components/layout/ToastContainer';

export const App: React.FC = () => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { showError, showSuccess } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Filtros
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOnlyMyTasks, setFilterOnlyMyTasks] = useState<boolean>(false);

  // Modales
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  // Cargar lista de tableros accesibles para el usuario
  const loadCategories = useCallback(async (preferredCategoryId?: string) => {
    try {
      const cats = await api.categories.listMine();
      setCategories(cats);

      if (cats.length > 0) {
        const targetId =
          preferredCategoryId ||
          (activeCategory && cats.some((c) => c.id === activeCategory.id)
            ? activeCategory.id
            : cats[0].id);
        await selectCategory(targetId);
      } else {
        setActiveCategory(null);
        setTasks([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error al cargar tableros', err.detail);
      }
    }
  }, [activeCategory, showError]);

  // Seleccionar tablero y cargar su detalle + tareas
  const selectCategory = async (categoryId: string) => {
    try {
      setIsLoadingData(true);
      const detail = await api.categories.getDetail(categoryId);
      setActiveCategory(detail);

      const categoryTasks = await api.tasks.list({ category_id: categoryId });
      setTasks(categoryTasks);
      setSelectedStateId(''); // Resetear filtro de estado
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error al cargar tablero', err.detail);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCategories();
    }
  }, [currentUser]);

  // Verificar si el usuario actual es dueño o colaborador del tablero activo
  const currentCollaborator = activeCategory?.collaborators.find(
    (c) => c.user_id === currentUser?.id
  );
  const isBoardOwner = currentCollaborator?.ownership ?? false;
  const isBoardCollaborator = !!currentCollaborator;

  // Tareas filtradas reactivamente
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Filtro por Estado
      if (selectedStateId && t.status_id !== selectedStateId) {
        return false;
      }
      // Filtro por mis asignaciones
      if (filterOnlyMyTasks && t.responsible_id !== currentUser?.id) {
        return false;
      }
      // Filtro por búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [tasks, selectedStateId, filterOnlyMyTasks, searchQuery, currentUser?.id]);

  const myTasksCount = useMemo(() => {
    return tasks.filter((t) => t.responsible_id === currentUser?.id).length;
  }, [tasks, currentUser?.id]);

  // ACCIONES REACTIVAS (Actualizan la UI inmediatamente sin recargar / F5)

  // 1. Avanzar de estado una tarea
  const handleAdvanceTask = async (taskId: string, nextStatusId: string) => {
    try {
      const updated = await api.tasks.update(taskId, { status_id: nextStatusId });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showSuccess('Estado actualizado', `Tarea movida a ${updated.status.name}.`);
    } catch (err) {
      if (err instanceof ApiError) {
        showError('No se pudo actualizar el estado', err.detail);
      }
    }
  };

  // 2. Cambiar de estado desde el selector en la lista
  const handleStatusChange = async (taskId: string, newStatusId: string) => {
    try {
      const updated = await api.tasks.update(taskId, { status_id: newStatusId });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showSuccess('Estado cambiado', `La tarea ahora está en "${updated.status.name}".`);
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error al cambiar estado', err.detail);
      }
    }
  };

  // 3. Crear o editar tarea
  const handleCreateOrEditTask = async (
    data: TaskCreate | TaskUpdate,
    isEditing: boolean
  ): Promise<boolean> => {
    try {
      if (isEditing && editingTask) {
        const updated = await api.tasks.update(editingTask.id, data as TaskUpdate);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
        showSuccess('Tarea actualizada con éxito');
      } else {
        const created = await api.tasks.create(data as TaskCreate);
        setTasks((prev) => [created, ...prev]);
        showSuccess('Tarea creada con éxito');
      }
      setEditingTask(null);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error con la tarea', err.detail);
      }
      return false;
    }
  };

  // 4. Eliminar tarea
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    try {
      await api.tasks.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showSuccess('Tarea eliminada');
    } catch (err) {
      if (err instanceof ApiError) {
        showError('No se pudo eliminar la tarea', err.detail);
      }
    }
  };

  // 5. Crear nuevo estado
  const handleAddState = async (name: string) => {
    if (!activeCategory) return;
    try {
      const newState = await api.states.create(activeCategory.id, { name });
      setActiveCategory({
        ...activeCategory,
        states: [...activeCategory.states, newState],
      });
      showSuccess('Estado creado', `Columna "${newState.name}" añadida.`);
    } catch (err) {
      if (err instanceof ApiError) {
        showError('No se pudo crear el estado', err.detail);
      }
    }
  };

  // 6. Eliminar estado
  const handleDeleteState = async (stateId: string) => {
    if (!activeCategory) return;
    if (!window.confirm('¿Deseas eliminar este estado? Solo es posible si no contiene tareas.'))
      return;
    try {
      await api.states.delete(stateId);
      // Recargar detalle del tablero para obtener la lista reordenada de estados
      const freshDetail = await api.categories.getDetail(activeCategory.id);
      setActiveCategory(freshDetail);
      showSuccess('Estado eliminado correctamente');
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error al eliminar estado', err.detail);
      }
    }
  };

  // 7. Invitar colaborador
  const handleAddCollaborator = async (email: string): Promise<boolean> => {
    if (!activeCategory) return false;
    try {
      await api.categories.addCollaborator(activeCategory.id, { email });
      const freshDetail = await api.categories.getDetail(activeCategory.id);
      setActiveCategory(freshDetail);
      showSuccess('Colaborador añadido', `${email} ahora es miembro del tablero.`);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        showError('No se pudo añadir colaborador', err.detail);
      }
      return false;
    }
  };

  // 8. Crear categoría / tablero
  const handleCreateCategory = async (data: CategoryCreate): Promise<boolean> => {
    try {
      const newCat = await api.categories.create(data);
      showSuccess('Tablero creado', `Tablero "${newCat.name}" listo.`);
      await loadCategories(newCat.id);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        showError('Error al crear tablero', err.detail);
      }
      return false;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-on-surface">Cargando FlowTask...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface text-on-surface select-none">
      {/* 1. Barra de Navegación Superior */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefreshData={() => activeCategory && selectCategory(activeCategory.id)}
      />

      {/* 2. Barra de Tablero Activo */}
      <BoardBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={selectCategory}
        onOpenCreateCategory={() => setIsCategoryModalOpen(true)}
        onOpenAddCollaborator={() => setIsCollabModalOpen(true)}
        filterOnlyMyTasks={filterOnlyMyTasks}
        onToggleMyTasks={() => setFilterOnlyMyTasks(!filterOnlyMyTasks)}
        myTasksCount={myTasksCount}
      />

      {/* 3. Barra de Filtros (Estado, Búsqueda y Botón Nueva Tarea) */}
      <FilterBar
        states={activeCategory?.states || []}
        selectedStateId={selectedStateId}
        onSelectStateId={setSelectedStateId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        canCreateTask={isBoardCollaborator}
        totalTasks={filteredTasks.length}
      />

      {/* 4. Canvas Principal de Tareas (Kanban o Lista) */}
      {isLoadingData ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-outline">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
          <p className="text-xs font-mono">Cargando actividades del tablero...</p>
        </div>
      ) : activeCategory ? (
        viewMode === 'kanban' ? (
          <KanbanBoard
            states={activeCategory.states}
            tasks={filteredTasks}
            isBoardOwner={isBoardOwner}
            onAdvanceTask={handleAdvanceTask}
            onDeleteTask={handleDeleteTask}
            onDeleteState={handleDeleteState}
            onAddState={handleAddState}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            states={activeCategory.states}
            isBoardOwner={isBoardOwner}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
          />
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-outline">
          <span className="material-symbols-outlined text-4xl mb-2 text-primary">splitscreen</span>
          <h3 className="text-sm font-semibold text-on-surface">No hay tableros activos</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-4">
            Crea tu primer tablero para comenzar a organizar tus tareas y flujos de trabajo.
          </p>
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold shadow-sm"
          >
            Crear Tablero
          </button>
        </div>
      )}

      {/* 5. Footer Status Bar de Stitch */}
      <footer className="w-full h-8 bg-surface-container-lowest border-t border-outline-variant px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-outline shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronizado con API v1</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Rol en este tablero: {isBoardOwner ? 'Dueño (Control Total)' : isBoardCollaborator ? 'Colaborador (Avance y Creación)' : 'Sin acceso'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-primary font-semibold">
            {myTasksCount} asignadas a ti
          </span>
        </div>
      </footer>

      {/* Modales */}
      {activeCategory && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleCreateOrEditTask}
          categoryId={activeCategory.id}
          states={activeCategory.states}
          collaborators={activeCategory.collaborators}
          isBoardOwner={isBoardOwner}
          initialTask={editingTask}
        />
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />

      {activeCategory && (
        <CollaboratorModal
          isOpen={isCollabModalOpen}
          onClose={() => setIsCollabModalOpen(false)}
          onSubmit={handleAddCollaborator}
          collaborators={activeCategory.collaborators}
        />
      )}

      {/* Notificaciones Toast */}
      <ToastContainer />
    </div>
  );
};
export default App;
