import React, { useState } from 'react';
import { CategoryCreate } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryCreate) => Promise<boolean>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const ok = await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      if (ok) {
        setName('');
        setDescription('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">dashboard_customize</span>
            <h3 className="font-bold text-base sm:text-lg text-on-surface">Crear Nuevo Tablero</h3>
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
          <div>
            <label htmlFor="catName" className="block text-xs font-semibold text-on-surface mb-1">
              Nombre del Tablero / Categoría *
            </label>
            <input
              id="catName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Marketing Digital Q4"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface"
            />
          </div>

          <div>
            <label htmlFor="catDesc" className="block text-xs font-semibold text-on-surface mb-1">
              Descripción opcional
            </label>
            <textarea
              id="catDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito o naturaleza del tablero..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-surface-container-high/50 border border-outline-variant/60 text-xs text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">info</span>
            <span>
              Al crear este tablero, serás asignado automáticamente como <strong>Dueño</strong> y se autogenerará la columna obligatoria <strong>BACKLOG</strong>.
            </span>
          </div>

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
                <span className="material-symbols-outlined text-sm">add</span>
              )}
              <span>Crear Tablero</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
