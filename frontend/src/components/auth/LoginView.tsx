import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DemoAccountsModal } from './DemoAccountsModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const LoginView: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      if (!name.trim() || !email.trim()) return;
      await register(name, email);
    } else {
      if (!email.trim()) return;
      await login(email);
    }
  };

  const handleSeedReset = async () => {
    try {
      setIsResetting(true);
      const res = await api.seed.reset();
      showSuccess('Base de datos inicializada', `${res.users} usuarios, ${res.categories} tableros y ${res.tasks} tareas creadas.`);
    } catch {
      showError('Error al resetear', 'No se pudo conectar con el endpoint /seed.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-surface relative select-none">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl p-8 relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md mb-3">
            <span className="material-symbols-outlined text-2xl">splitscreen</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">FlowTask</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Tableros colaborativos y seguimiento de tareas en tiempo real
          </p>
        </div>

        {/* Cuentas Demo Button (Prominente) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-xl">account_circle</span>
              <div className="text-left">
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-90">Recomendado</span>
                <span className="text-sm font-bold block">Ver y Acceder con Cuentas Demo</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-5">
          <div className="border-t border-outline-variant w-full" />
          <span className="bg-surface-container-lowest px-3 text-xs text-outline uppercase font-mono">
            o inicia sesión con tu email
          </span>
        </div>

        {/* Formulario de Login / Registro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="name">
                Nombre completo
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">
                  person
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Mendoza"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="email">
              Correo electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">
                mail
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@flowtask.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-on-surface transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">
                {isRegisterMode ? 'how_to_reg' : 'login'}
              </span>
            )}
            <span>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-5 text-center text-xs text-on-surface-variant">
          {isRegisterMode ? (
            <span>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-primary font-semibold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </span>
          ) : (
            <span>
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-primary font-semibold hover:underline"
              >
                Regístrate gratis
              </button>
            </span>
          )}
        </div>

        {/* Seed Reset helper */}
        <div className="mt-6 pt-4 border-t border-outline-variant/60 flex items-center justify-between text-xs text-outline">
          <span>¿Base de datos vacía?</span>
          <button
            type="button"
            onClick={handleSeedReset}
            disabled={isResetting}
            className="text-xs text-primary hover:underline font-mono flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>{isResetting ? 'Sembrando...' : 'Poblar datos demo (Seed)'}</span>
          </button>
        </div>
      </div>

      <DemoAccountsModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
