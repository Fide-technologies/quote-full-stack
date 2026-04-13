import { createContext, useContext } from 'react';

export interface ToastOptions {
    content: string;
    error?: boolean;
    duration?: number;
}

interface NotificationContextType {
    showToast: (options: ToastOptions) => void;
    toast: ToastOptions | null;
    hideToast: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);



export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
