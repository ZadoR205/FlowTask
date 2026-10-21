import React, { useState, useEffect } from 'react';
import { Task, State, Collaborator, TaskCreate, TaskUpdate } from '../../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate | TaskUpdate, isEditing: boolean) => Promise<boolean>;
  categoryId: string;
  states: State[];
  collaborators: Collaborator[];
  isBoardOwner: boolean;
  initialTask?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categoryId,
  states,
  collaborators,
  isBoardOwner,
  initialTask,
}) => {
  const isEditing = !!initialTask;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [statusId, setStatusId] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setDueDate(initialTask.due_date ? initialTask.due_date.slice(0, 10) : '');
      setStatusId(initialTask.status_id || '');
      setResponsibleId(initialTask.responsible_id || '');
    } else {
      setTitle('');
      setDescription('');
      // Default due date: en 3 días
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().slice(0, 10));

      const backlog = states.find((s) => s.order === 0) || states[0];
      setStatusId(backlog ? backlog.id : '');
      setResponsibleId('');
    }
  }, [initialTask, states, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const updatePayload: TaskUpdate = {
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate,
          status_id: statusId || undefined,
          responsible_id: isBoardOwner ? (responsibleId ? responsibleId : null) : undefined,
        };
        const ok = await onSubmit(updatePayload, true);
        if (ok) onClose();
      } else {
        const createPayload: TaskCreate = {
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          due_date: dueDate,
          status_id: statusId || undefined,
          responsible_id: isBoardOwner && responsibleId ? responsibleId : undefined,
        };
        const ok = await onSubmit(createPayload, false);
        if (ok) onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              {isEditing ? 'edit_note' : 'add_task'}
            </span>
            <h3 className="font-bold text-base sm:text-lg text-on-surface">
              {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Título (Max 25 chars) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="taskTitle" className="text-xs font-semibold text-on-surface">
                Título de la tarea *
              </label>
              <span className={`text-[10px] font-mono ${title.length > 25 ? 'text-error font-bold' : 'text-outline'}`}>
                {title.length}/25 caracteres
              </span>
            </div>
            <input
              id="taskTitle"
              type="text"
              required
              maxLength={25}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Rediseño del Header"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="taskDesc" className="block text-xs font-semibold text-on-surface mb-1">
              Descripción detallada *
            </label>
            <textarea
              id="taskDesc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué se debe realizar en esta actividad..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fecha Límite */}
            <div>
              <label htmlFor="taskDueDate" className="block text-xs font-semibold text-on-surface mb-1">
                Fecha Límite *
              </label>
              <input
                id="taskDueDate"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface font-mono"
              />
            </div>

            {/* Estado Inicial */}
            <div>
              <label htmlFor="taskStatus" className="block text-xs font-semibold text-on-surface mb-1">
                Estado
              </label>
              <select
                id="taskStatus"
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} {st.order === 0 ? '(Por defecto)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asignación de Responsable (Solo Dueño) */}
          <div>
            <label htmlFor="taskResponsible" className="block text-xs font-semibold text-on-surface mb-1">
              Responsable asignado
            </label>
            {isBoardOwner ? (
              <select
                id="taskResponsible"
                value={responsibleId}
                onChange={(e) => setResponsibleId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface cursor-pointer"
              >
                <option value="">Sin asignar</option>
                {collaborators.map((c) => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.user?.name || 'Usuario'} ({c.user?.email}) {c.ownership ? '• Dueño' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/60 text-xs text-outline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Solo el Dueño del tablero puede asignar o modificar responsables.</span>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-sm">check</span>
              )}
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Tarea'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
