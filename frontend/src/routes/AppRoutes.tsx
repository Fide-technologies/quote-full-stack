import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Settings } from '../pages/Settings';
import { Quotes } from '../pages/Quotes';
import { DraftOrders } from '../pages/DraftOrders';
import { Plans } from '../pages/Plans';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/draft-orders" element={<DraftOrders />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
