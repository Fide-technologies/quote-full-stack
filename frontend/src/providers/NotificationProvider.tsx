import { type ReactNode, useCallback, useState } from 'react';
import { NotificationContext, type ToastOptions } from '@/hooks/useNotifications';

export function NotificationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setToast(options);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, toast, hideToast }}>
      {children}
    </NotificationContext.Provider>
  );
}
