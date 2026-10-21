import React, { useState } from 'react';
import { Collaborator } from '../../types';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<boolean>;
  collaborators: Collaborator[];
}

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  collaborators,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const ok = await onSubmit(email.trim());
      if (ok) {
        setEmail('');
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
            <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
            <h3 className="font-bold text-base sm:text-lg text-on-surface">Miembros del Tablero</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Formulario de Invitación */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label htmlFor="collabEmail" className="block text-xs font-semibold text-on-surface">
            Invitar por correo electrónico
          </label>
          <div className="flex gap-2">
            <input
              id="collabEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@flowtask.com"
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-sm">send</span>
              )}
              <span>Añadir</span>
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            El usuario debe estar previamente registrado en el sistema.
          </p>
        </form>

        {/* Lista de Miembros Actuales */}
        <div className="mt-5 pt-4 border-t border-outline-variant/60">
          <h4 className="text-xs font-mono font-semibold text-outline uppercase tracking-wider mb-2.5">
            Miembros actuales ({collaborators.length})
          </h4>

          <div className="max-h-48 overflow-y-auto custom-scroll space-y-2">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      c.ownership
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    {c.user?.name ? c.user.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-on-surface leading-tight truncate">
                      {c.user?.name || 'Usuario'}
                    </p>
                    <p className="text-[11px] font-mono text-outline truncate">{c.user?.email}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    c.ownership
                      ? 'bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {c.ownership ? 'Dueño' : 'Colaborador'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
