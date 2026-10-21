import React, { useState } from 'react';
import { Category, CategoryDetail, Collaborator } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BoardBarProps {
  categories: Category[];
  activeCategory: CategoryDetail | null;
  onSelectCategory: (categoryId: string) => void;
  onOpenCreateCategory: () => void;
  onOpenAddCollaborator: () => void;
  filterOnlyMyTasks: boolean;
  onToggleMyTasks: () => void;
  myTasksCount: number;
}

export const BoardBar: React.FC<BoardBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenCreateCategory,
  onOpenAddCollaborator,
  filterOnlyMyTasks,
  onToggleMyTasks,
  myTasksCount,
}) => {
  const { currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determinar si el usuario actual es dueño o colaborador en este tablero
  const currentCollaborator = activeCategory?.collaborators.find(
    (c) => c.user_id === currentUser?.id
  );
  const isOwner = currentCollaborator?.ownership ?? false;
  const isCollaborator = !!currentCollaborator;

  const ownerCollab = activeCategory?.collaborators.find((c) => c.ownership);
  const ownerName = ownerCollab?.user?.name || 'Dueño';

  const getInitials = (collab: Collaborator) => {
    if (collab.user?.name) {
      const parts = collab.user.name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return collab.user.name.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <section className="w-full h-12 bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-3">
        {/* Interactive Board Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-surface-container transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">dashboard</span>
              <span className="font-semibold text-sm sm:text-base text-on-surface tracking-tight truncate max-w-[160px] sm:max-w-[260px]">
                {activeCategory?.name || 'Selecciona un tablero'}
              </span>
            </div>

            {/* Role Indicator Badge */}
            {isOwner ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30">
                <span className="material-symbols-outlined text-xs">workspace_premium</span>
                <span>Dueño</span>
              </span>
            ) : isCollaborator ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant">
                <span className="material-symbols-outlined text-xs">edit</span>
                <span>Colaborador</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-outline bg-surface-container border border-outline-variant">
                <span>Sin acceso</span>
              </span>
            )}

            <span className="material-symbols-outlined text-outline text-base">
              {isDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown Menu of Boards */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-2.5 py-1 text-[11px] font-mono text-outline font-semibold tracking-wider uppercase">
                Mis tableros ({categories.length})
              </div>

              <div className="max-h-60 overflow-y-auto custom-scroll space-y-0.5 mt-1">
                {categories.map((cat) => {
                  const isActive = cat.id === activeCategory?.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-surface-container text-primary font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-base">
                          {isActive ? 'check_circle' : 'space_dashboard'}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-1 pt-1 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenCreateCategory();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>Crear nuevo tablero</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-outline-variant hidden sm:block" />

        {/* Team Members List */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-outline mr-1">Equipo:</span>
          <div className="flex -space-x-1.5 overflow-hidden">
            {activeCategory?.collaborators.slice(0, 5).map((collab) => (
              <div
                key={collab.id}
                className={`inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest text-[10px] font-bold flex items-center justify-center ${
                  collab.ownership
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary-container text-on-primary'
                }`}
                title={`${collab.user?.name || 'Miembro'} (${collab.ownership ? 'Dueño' : 'Colaborador'})`}
              >
                {getInitials(collab)}
              </div>
            ))}
          </div>

          <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-1">
            {activeCategory?.collaborators.length || 0} miembros
          </span>

          {/* Add member button (Only for Owner) */}
          {isOwner && (
            <button
              type="button"
              onClick={onOpenAddCollaborator}
              className="ml-1 p-1 rounded-full text-outline hover:text-primary hover:bg-primary/10 transition-colors"
              title="Invitar colaborador por correo"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Scope Notice & Quick Filter */}
      <div className="flex items-center gap-2">
        {/* Scope Pill */}
        {!isOwner && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant">
            <span className="material-symbols-outlined text-xs text-outline">lock</span>
            <span>Estructura gestionada por {ownerName}</span>
          </div>
        )}

        {/* Quick Filter: My Tasks */}
        <button
          type="button"
          onClick={onToggleMyTasks}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
            filterOnlyMyTasks
              ? 'bg-primary text-on-primary border-primary shadow-sm'
              : 'bg-primary/10 text-primary hover:bg-primary/15 border-primary/20'
          }`}
        >
          <span className="material-symbols-outlined text-sm">person</span>
          <span className="hidden sm:inline">Mis asignaciones</span>
          <span
            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
              filterOnlyMyTasks
                ? 'bg-white text-primary'
                : 'bg-primary text-on-primary'
            }`}
          >
            {myTasksCount}
          </span>
        </button>
      </div>
    </section>
  );
};
