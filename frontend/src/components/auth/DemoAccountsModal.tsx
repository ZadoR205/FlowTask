import React from 'react';
import { useAuth, DEMO_ACCOUNTS, DemoAccount } from '../../context/AuthContext';

interface DemoAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoAccountsModal: React.FC<DemoAccountsModalProps> = ({ isOpen, onClose }) => {
  const { loginWithDemo, isLoading } = useAuth();

  if (!isOpen) return null;

  const handleSelect = async (demo: DemoAccount) => {
    const success = await loginWithDemo(demo);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">group</span>
            <div>
              <h3 className="font-bold text-lg text-on-surface">Cuentas Demo Disponibles</h3>
              <p className="text-xs text-on-surface-variant">Selecciona un usuario para probar sus roles y permisos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container transition-colors text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              onClick={() => handleSelect(account)}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-surface-container-highest ${account.badgeColor}`}
                >
                  {account.avatarInitials}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
                    {account.name}
                  </h4>
                  <p className="text-xs font-mono text-outline">{account.email}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    {account.roleDescription}
                  </p>
                </div>
              </div>

              <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all text-lg">
                arrow_forward
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 p-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/60 flex items-start gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">info</span>
          <span>
            Cada usuario tiene permisos independientes sobre los tableros. Por ejemplo, <strong>Admin</strong> es dueño de Trabajo y Personal, mientras que <strong>Carlos Dev</strong> es dueño de Urgente y colaborador en Trabajo.
          </span>
        </div>
      </div>
    </div>
  );
};
