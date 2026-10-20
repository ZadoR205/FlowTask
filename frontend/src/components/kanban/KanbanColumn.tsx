import React from 'react';
import { State, Task } from '../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  state: State;
  tasks: Task[];
  allStates: State[];
  isBoardOwner: boolean;
  onAdvanceTask: (taskId: string, nextStatusId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteState: (stateId: string) => void;
  onEditTask?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  state,
  tasks,
  allStates,
  isBoardOwner,
  onAdvanceTask,
  onDeleteTask,
  onDeleteState,
  onEditTask,
}) => {
  const isBacklog = state.order === 0 || state.name.toUpperCase() === 'BACKLOG';

  const getStateDotColor = () => {
    if (state.name.toUpperCase() === 'BACKLOG') return 'bg-outline';
    if (state.name.toLowerCase().includes('proceso') || state.name.toLowerCase().includes('progreso')) {
      return 'bg-primary-container';
    }
    if (state.name.toLowerCase().includes('revisión')) {
      return 'bg-amber-500';
    }
    if (state.name.toLowerCase().includes('completad') || state.name.toLowerCase().includes('hecho')) {
      return 'bg-emerald-600';
    }
    return 'bg-primary';
  };

  return (
    <div className="w-[300px] max-w-[320px] shrink-0 max-h-full flex flex-col rounded-xl bg-surface-container-low border border-outline-variant shadow-xs">
      {/* Column Header */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-outline-variant/60">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${getStateDotColor()}`} />
          <h2 className="font-semibold text-sm text-on-surface tracking-tight truncate max-w-[170px]">
            {state.name}
          </h2>
          <span className="px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-surface-container-high text-on-surface-variant">
            {tasks.length}
          </span>
        </div>

        {/* State Action: Delete state if Owner and not Backlog */}
        {isBoardOwner && !isBacklog ? (
          <button
            type="button"
            onClick={() => onDeleteState(state.id)}
            className="p-1 rounded text-outline hover:text-error hover:bg-error-container/30 transition-colors"
            title="Eliminar este estado (solo si no tiene tareas)"
          >
            <span className="material-symbols-outlined text-base">delete_outline</span>
          </button>
        ) : isBacklog ? (
          <span
            className="material-symbols-outlined text-outline text-base"
            title="Estado base BACKLOG (protegido contra eliminación)"
          >
            lock_outline
          </span>
        ) : null}
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scroll min-h-[150px]">
        {tasks.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-outline-variant/60 rounded-lg text-outline text-xs">
            <span className="material-symbols-outlined text-xl mb-1 opacity-60">inbox</span>
            <span>Sin tareas</span>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              states={allStates}
              isBoardOwner={isBoardOwner}
              onAdvanceTask={onAdvanceTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
