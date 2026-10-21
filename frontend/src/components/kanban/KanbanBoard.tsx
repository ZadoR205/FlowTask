import React, { useState } from 'react';
import { State, Task } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  states: State[];
  tasks: Task[];
  isBoardOwner: boolean;
  onAdvanceTask: (taskId: string, nextStatusId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteState: (stateId: string) => void;
  onAddState: (name: string) => void;
  onEditTask?: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  states,
  tasks,
  isBoardOwner,
  onAdvanceTask,
  onDeleteTask,
  onDeleteState,
  onAddState,
  onEditTask,
}) => {
  const [isAddingState, setIsAddingState] = useState(false);
  const [newStateName, setNewStateName] = useState('');

  const sortedStates = [...states].sort((a, b) => a.order - b.order);

  const handleCreateState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;
    onAddState(newStateName.trim());
    setNewStateName('');
    setIsAddingState(false);
  };

  return (
    <main className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scroll p-4 sm:p-6 bg-surface">
      <div className="inline-flex h-full gap-4 items-start min-w-full pb-2">
        {sortedStates.map((state) => {
          const columnTasks = tasks.filter((t) => t.status_id === state.id);
          return (
            <KanbanColumn
              key={state.id}
              state={state}
              tasks={columnTasks}
              allStates={sortedStates}
              isBoardOwner={isBoardOwner}
              onAdvanceTask={onAdvanceTask}
              onDeleteTask={onDeleteTask}
              onDeleteState={onDeleteState}
              onEditTask={onEditTask}
            />
          );
        })}

        {/* Botón "+ Añadir Estado" (Solo para Dueño del Tablero) */}
        {isBoardOwner && (
          <div className="w-[280px] shrink-0">
            {isAddingState ? (
              <form
                onSubmit={handleCreateState}
                className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md space-y-2"
              >
                <input
                  type="text"
                  required
                  autoFocus
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  placeholder="Nombre del nuevo estado..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingState(false);
                      setNewStateName('');
                    }}
                    className="px-2.5 py-1 text-xs text-outline hover:text-on-surface rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-primary text-on-primary rounded-md text-xs font-semibold shadow-xs hover:bg-primary-container"
                  >
                    Crear Estado
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingState(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-outline-variant hover:border-primary text-outline hover:text-primary hover:bg-surface-container-lowest/60 transition-all text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Añadir Columna de Estado</span>
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
