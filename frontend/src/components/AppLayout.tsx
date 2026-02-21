import React from 'react';
import { useLocation } from 'react-router-dom';
import { TitleBar, NavMenu } from '@shopify/app-bridge-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const getTitle = (path: string) => {
        switch (path) {
            case '/': return 'Dashboard';
            case '/settings': return 'Settings';
            case '/quotes': return 'Quotes';
            case '/draft-orders': return 'Draft Orders';
            case '/plans': return 'Plans & Billing';
            default: return 'My B2B App';
        }
    };

    return (
        <>
            <NavMenu>
                <a href="/" rel="home">Dashboard</a>
                <a href="/settings">Settings</a>
                <a href='/quotes'>Quotes</a>
                <a href='/draft-orders'>Draft Orders</a>
                <a href='/plans'>Plans & Billing</a>
            </NavMenu>

            <TitleBar title={getTitle(location.pathname)} />

            {children}
        </>
    );
};
