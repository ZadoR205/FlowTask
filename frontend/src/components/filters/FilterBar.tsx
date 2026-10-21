import React from 'react';
import { State } from '../../types';

interface FilterBarProps {
  states: State[];
  selectedStateId: string;
  onSelectStateId: (stateId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateTask: () => void;
  canCreateTask: boolean;
  totalTasks: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  states,
  selectedStateId,
  onSelectStateId,
  searchQuery,
  onSearchChange,
  onOpenCreateTask,
  canCreateTask,
  totalTasks,
}) => {
  return (
    <div className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-on-surface transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Dropdown de Filtro por Estado (Requerimiento explícito de la tarea) */}
        <div className="flex items-center gap-2">
          <label htmlFor="stateFilter" className="text-xs font-semibold text-outline hidden sm:inline">
            Estado:
          </label>
          <div className="relative">
            <select
              id="stateFilter"
              value={selectedStateId}
              onChange={(e) => onSelectStateId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Todos los Estados</option>
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-outline text-base pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Tasks Count Badge */}
        <span className="text-xs text-outline font-mono bg-surface-container px-2 py-1 rounded-md">
          {totalTasks} {totalTasks === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>

      {/* Button: + Nueva Tarea */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCreateTask}
          disabled={!canCreateTask}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            canCreateTask
              ? 'bg-primary hover:bg-primary-container text-on-primary active:scale-95'
              : 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant'
          }`}
          title={
            canCreateTask
              ? 'Crear una nueva tarea en este tablero'
              : 'Debes ser colaborador o dueño de este tablero para crear tareas'
          }
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Nueva Tarea</span>
        </button>
      </div>
    </div>
  );
};
