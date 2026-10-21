import React from 'react';
import { Task, State } from '../../types';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  states: State[];
  isBoardOwner: boolean;
  onStatusChange: (taskId: string, newStatusId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  states,
  isBoardOwner,
  onStatusChange,
  onDeleteTask,
  onEditTask,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8 text-center text-outline">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-3 text-primary">
          <span className="material-symbols-outlined text-3xl">inbox</span>
        </div>
        <h3 className="text-sm font-semibold text-on-surface">No se encontraron tareas</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mt-1">
          No hay tareas que coincidan con los filtros aplicados o este tablero aún no tiene actividades creadas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-auto custom-scroll p-4 sm:p-6 bg-surface">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-mono font-semibold text-outline uppercase tracking-wider">
              <th className="py-3 px-4">Título & Descripción</th>
              <th className="py-3 px-4">Categoría (Tablero)</th>
              <th className="py-3 px-4">Fecha Límite</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Responsable</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                states={states}
                isBoardOwner={isBoardOwner}
                onStatusChange={onStatusChange}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
