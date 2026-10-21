import React from 'react';
import { Task, State } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface KanbanCardProps {
  task: Task;
  states: State[];
  isBoardOwner: boolean;
  onAdvanceTask: (taskId: string, nextStatusId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  states,
  isBoardOwner,
  onAdvanceTask,
  onDeleteTask,
  onEditTask,
}) => {
  const { currentUser } = useAuth();

  const isAssignedToMe = task.responsible_id === currentUser?.id;
  const canModify = isBoardOwner || isAssignedToMe;

  // Encontrar el siguiente estado correlativo en la lista ordenada de estados
  const sortedStates = [...states].sort((a, b) => a.order - b.order);
  const currentIndex = sortedStates.findIndex((s) => s.id === task.status_id);
  const nextState =
    currentIndex >= 0 && currentIndex < sortedStates.length - 1
      ? sortedStates[currentIndex + 1]
      : null;

  // Estado final alcanzado (última columna)
  const isCompleted = currentIndex === sortedStates.length - 1 && sortedStates.length > 1;

  // Formatear fecha límite
  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Sin fecha';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getBorderColor = () => {
    if (isCompleted) return 'border-l-emerald-600';
    if (task.status.order === 0) return 'border-l-outline';
    if (task.status.name.toLowerCase().includes('proceso') || task.status.name.toLowerCase().includes('progreso')) {
      return 'border-l-primary-container';
    }
    if (task.status.name.toLowerCase().includes('revisión')) {
      return 'border-l-amber-500';
    }
    return 'border-l-primary';
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all flex flex-col gap-2.5 relative border-l-4 ${getBorderColor()} ${
        canModify
          ? 'bg-surface-container-lowest border-outline-variant card-shadow card-hover'
          : 'bg-surface-container border-dashed border-outline-variant/80 opacity-90'
      }`}
    >
      {/* Header: Estado/Categoría & Modo Solo Lectura / Borrar */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase tracking-wider">
            {task.status.name}
          </span>
          <span className="text-[11px] font-mono text-outline">#{task.id.slice(0, 6)}</span>
        </div>

        <div className="flex items-center gap-1">
          {!canModify ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-medium">
              <span className="material-symbols-outlined text-[10px]">lock</span>
              <span>Solo lectura</span>
            </span>
          ) : isBoardOwner ? (
            <div className="flex items-center gap-0.5">
              {onEditTask && (
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                  title="Editar tarea"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className="p-1 rounded text-outline hover:text-error hover:bg-error-container/30 transition-colors"
                title="Eliminar tarea (Solo dueño)"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Título de la tarea */}
      <h3
        className={`font-semibold text-sm leading-snug text-on-surface break-words ${
          isCompleted ? 'line-through text-outline' : ''
        }`}
      >
        {task.title}
      </h3>

      {/* Descripción de la tarea */}
      {task.description && (
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Metadata: Fecha Límite */}
      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1 text-[11px] font-mono">
          <span className="material-symbols-outlined text-xs text-outline">schedule</span>
          <span>{formatDueDate(task.due_date)}</span>
        </span>

        {task.category_name && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-outline truncate max-w-[120px]">
            <span className="material-symbols-outlined text-xs">folder</span>
            <span className="truncate">{task.category_name}</span>
          </span>
        )}
      </div>

      {/* Footer: Responsable & Botón de Avance */}
      <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between mt-0.5">
        <div className="flex items-center gap-1.5 truncate max-w-[130px]">
          <div
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
              isAssignedToMe
                ? 'bg-primary-container text-on-primary ring-1 ring-primary'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {task.responsible?.name ? task.responsible.name.slice(0, 2).toUpperCase() : '—'}
          </div>
          <span
            className={`text-xs truncate ${
              isAssignedToMe ? 'text-primary font-semibold' : 'text-outline font-medium'
            }`}
          >
            {isAssignedToMe ? 'Asignada a ti' : task.responsible?.name || 'Sin asignar'}
          </span>
        </div>

        {/* Botón de Avance de Estado */}
        {canModify && nextState ? (
          <button
            type="button"
            onClick={() => onAdvanceTask(task.id, nextState.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-on-primary hover:bg-primary-container active:scale-95 transition-all text-xs font-semibold shadow-xs"
            title={`Avanzar tarea a '${nextState.name}'`}
          >
            <span className="hidden xs:inline">Avanzar a</span>
            <span className="truncate max-w-[70px]">{nextState.name}</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        ) : isCompleted ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 font-mono">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            <span>Completada</span>
          </span>
        ) : null}
      </div>
    </div>
  );
};
