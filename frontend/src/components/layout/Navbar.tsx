import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DemoAccountsModal } from '../auth/DemoAccountsModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export type ViewMode = 'kanban' | 'list';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  onRefreshData,
}) => {
  const { currentUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSeed = async () => {
    try {
      setIsResetting(true);
      const res = await api.seed.reset();
      localStorage.removeItem('flowtask_user_id');
      localStorage.removeItem('flowtask_user_data');
      showSuccess(
        'Base de datos reseteada',
        `${res.categories} tableros y ${res.tasks} tareas cargadas. Recargando...`
      );
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {
      showError('Error en Seed', 'No se pudo resetear la base de datos.');
      setIsResetting(false);
    }
  };

  return (
    <header className="w-full h-14 flex items-center justify-between px-4 sm:px-6 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-30 shrink-0">
      {/* Brand Logo & View Toggle */}
      <div className="flex items-center gap-6">
        <div className="font-bold text-lg text-primary flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-primary text-2xl">splitscreen</span>
          <span className="tracking-tight">FlowTask</span>
        </div>

        {/* View Mode Switcher (Kanban vs Lista) */}
        <div className="flex items-center bg-surface-container p-0.5 rounded-lg border border-outline-variant/60">
          <button
            type="button"
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">view_kanban</span>
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            <span className="hidden sm:inline">Lista Detallada</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Reset / Seed Button */}
        <button
          type="button"
          onClick={handleSeed}
          disabled={isResetting}
          title="Resetear y poblar datos iniciales (Seed)"
          className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span className={`material-symbols-outlined text-sm ${isResetting ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isResetting ? 'Reseteando...' : 'Seed Data'}</span>
        </button>

        {/* Switch to Demo Account Button */}
        <button
          type="button"
          onClick={() => setIsDemoModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-primary">switch_account</span>
          <span className="hidden sm:inline">Cuentas Demo</span>
        </button>

        {/* Active User Indicator & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 pl-3 border-l border-outline-variant hover:opacity-90 transition-opacity"
          >
            <div className="hidden lg:flex flex-col text-right">
              <span className="font-semibold text-xs text-on-surface leading-none">
                {currentUser?.name || 'Usuario'}
              </span>
              <span className="font-mono text-[10px] text-outline mt-0.5 truncate max-w-[120px]">
                {currentUser?.email}
              </span>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-surface-container-highest">
                {getInitials(currentUser?.name)}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface-container-lowest rounded-full"
                title="En línea"
              />
            </div>
            <span className="material-symbols-outlined text-outline text-base">
              {isUserMenuOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-3 py-2 border-b border-outline-variant/60">
                <p className="text-xs font-bold text-on-surface">{currentUser?.name}</p>
                <p className="text-[11px] font-mono text-outline truncate">{currentUser?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors mt-1"
              >
                <span className="material-symbols-outlined text-base text-primary">groups</span>
                <span>Cambiar de usuario</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <DemoAccountsModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </header>
  );
};
