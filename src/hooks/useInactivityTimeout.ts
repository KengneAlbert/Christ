import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInactivityTimeoutProps {
  onTimeout: () => void;
  timeout?: number; // en millisecondes
  warningTime?: number; // temps avant timeout pour afficher l'avertissement
}

export const useInactivityTimeout = ({
  onTimeout,
  timeout = 15 * 60 * 1000, // 15 minutes par défaut
  warningTime = 2 * 60 * 1000, // 2 minutes d'avertissement par défaut
}: UseInactivityTimeoutProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const startCountdown = useCallback(() => {
    setRemainingTime(warningTime);
    countdownIntervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1000) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  }, [warningTime]);

  const resetTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setRemainingTime(0);

    // Timer pour afficher l'avertissement
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, timeout - warningTime);

    // Timer pour la déconnexion
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [onTimeout, timeout, warningTime, startCountdown]);

  const extendSession = () => {
    resetTimer();
  };

  useEffect(() => {
    // Événements à surveiller pour détecter l'activité
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    // Initialiser le timer
    resetTimer();

    // Ajouter les listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Nettoyer au démontage
    return () => {
      clearTimers();
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [showWarning, resetTimer]); // Redémarrer uniquement quand showWarning change

  return {
    showWarning,
    remainingTime,
    extendSession,
  };
};
