import React, { useEffect, useRef } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface InactivityWarningModalProps {
  isOpen: boolean;
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}

const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  remainingTime,
  onExtend,
  onLogout,
}) => {
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Focus first actionable button
    firstBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Allow ESC to extend session (stay logged in)
        e.preventDefault();
        onExtend();
      }
      if (e.key === "Tab") {
        // Basic focus trap between buttons
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === firstBtnRef.current) {
            e.preventDefault();
            lastBtnRef.current?.focus();
          }
        } else {
          if (active === lastBtnRef.current) {
            e.preventDefault();
            firstBtnRef.current?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onExtend, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inactivity-title"
          aria-describedby="inactivity-desc"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3
                id="inactivity-title"
                className="text-lg font-semibold text-amber-900"
              >
                Session inactive
              </h3>
            </div>
          </div>

          {/* Body */}
          <div id="inactivity-desc" className="px-6 py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Clock className="h-16 w-16 text-amber-500 animate-pulse" />
              </div>
            </div>

            <p className="text-center text-slate-700 mb-4">
              Votre session va expirer dans
            </p>

            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-amber-600">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600">
              Pour des raisons de sécurité, vous serez automatiquement
              déconnecté après 15 minutes d'inactivité.
            </p>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
            <button
              ref={firstBtnRef}
              onClick={onLogout}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              Se déconnecter
            </button>
            <button
              ref={lastBtnRef}
              onClick={onExtend}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Rester connecté
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarningModal;
