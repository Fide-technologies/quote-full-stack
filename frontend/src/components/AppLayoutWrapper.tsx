import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';

export const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    // Paths that should be publicly accessible  without App Bridge frame components
    const publicPaths = ['/legal', '/support'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (isPublicPath) {
        return <>{children}</>;
    }

    return <AppLayout>{children}</AppLayout>;
};
