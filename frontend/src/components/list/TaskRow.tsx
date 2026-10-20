import React from 'react';
import { Task, State } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TaskRowProps {
  task: Task;
  states: State[];
  isBoardOwner: boolean;
  onStatusChange: (taskId: string, newStatusId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  states,
  isBoardOwner,
  onStatusChange,
  onDeleteTask,
  onEditTask,
}) => {
  const { currentUser } = useAuth();
  const isAssignedToMe = task.responsible_id === currentUser?.id;
  const canModify = isBoardOwner || isAssignedToMe;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeStyle = (stateName: string) => {
    const lower = stateName.toLowerCase();
    if (lower.includes('completad') || lower.includes('hecho')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (lower.includes('proceso') || lower.includes('progreso')) {
      return 'bg-primary/10 text-primary border-primary/30';
    }
    if (lower.includes('revisión')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
  };

  return (
    <tr className="border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors group">
      {/* Título y descripción */}
      <td className="py-3 px-4 max-w-xs">
        <div className="flex flex-col">
          <span className="font-semibold text-xs sm:text-sm text-on-surface leading-snug break-words">
            {task.title}
          </span>
          {task.description && (
            <span className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
              {task.description}
            </span>
          )}
        </div>
      </td>

      {/* Categoría (Nombre Legible) - Requisito técnico explícito */}
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant">
          <span className="material-symbols-outlined text-xs text-primary">folder</span>
          <span>{task.category_name || 'Tablero'}</span>
        </span>
      </td>

      {/* Fecha Límite */}
      <td className="py-3 px-4 whitespace-nowrap text-xs font-mono text-on-surface-variant">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-outline">schedule</span>
          <span>{formatDate(task.due_date)}</span>
        </div>
      </td>

      {/* Estado (con dropdown interactivo si tiene permisos) */}
      <td className="py-3 px-4 whitespace-nowrap">
        {canModify ? (
          <div className="relative inline-block">
            <select
              value={task.status_id}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              className={`appearance-none text-xs font-mono font-semibold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${getStatusBadgeStyle(
                task.status.name
              )}`}
            >
              {states.map((st) => (
                <option key={st.id} value={st.id} className="text-on-surface bg-surface-container-lowest">
                  {st.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1.5 text-xs pointer-events-none opacity-60">
              unfold_more
            </span>
          </div>
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getStatusBadgeStyle(
              task.status.name
            )}`}
          >
            {task.status.name}
          </span>
        )}
      </td>

      {/* Responsable */}
      <td className="py-3 px-4 whitespace-nowrap text-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              isAssignedToMe
                ? 'bg-primary-container text-on-primary ring-1 ring-primary'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {task.responsible?.name ? task.responsible.name.slice(0, 2).toUpperCase() : '—'}
          </div>
          <span className={isAssignedToMe ? 'font-semibold text-primary' : 'text-outline'}>
            {isAssignedToMe ? 'Tú' : task.responsible?.name || 'Sin asignar'}
          </span>
        </div>
      </td>

      {/* Acciones */}
      <td className="py-3 px-4 whitespace-nowrap text-right text-xs">
        <div className="flex items-center justify-end gap-1">
          {isBoardOwner && onEditTask && (
            <button
              type="button"
              onClick={() => onEditTask(task)}
              className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
              title="Editar tarea"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          )}

          {isBoardOwner ? (
            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="p-1 rounded text-outline hover:text-error hover:bg-error-container/30 transition-colors"
              title="Eliminar tarea (Solo dueño)"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          ) : (
            <span className="material-symbols-outlined text-outline text-base opacity-40" title="Solo lectura">
              lock
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};
