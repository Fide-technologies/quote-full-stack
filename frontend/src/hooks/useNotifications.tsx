import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

interface ToastOptions {
    content: string;
    error?: boolean;
    duration?: number;
}

interface NotificationContextType {
    showToast: (options: ToastOptions) => void;
    toast: ToastOptions | null;
    hideToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

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
            {/* The actual Toast component is rendered in AppLayout */}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
