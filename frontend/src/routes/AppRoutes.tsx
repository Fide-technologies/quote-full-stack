import type React from 'react';
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageLoader } from '../components/loaders/PageLoader';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const EmailSettings = lazy(() => import('../pages/EmailSettings'));
const FormBuilder = lazy(() => import('../pages/FormBuilder').then(m => ({ default: m.FormBuilder })));
const Quotes = lazy(() => import('../pages/Quotes').then(m => ({ default: m.Quotes })));
const QuoteDetails = lazy(() => import('../pages/QuoteDetails').then(m => ({ default: m.QuoteDetails })));
const DraftOrders = lazy(() => import('../pages/DraftOrders').then(m => ({ default: m.DraftOrders })));
const Plans = lazy(() => import('../pages/Plans').then(m => ({ default: m.Plans })));
const Legal = lazy(() => import('../pages/Legal').then(m => ({ default: m.Legal })));
const Support = lazy(() => import('../pages/Support').then(m => ({ default: m.Support })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/email-settings" element={<EmailSettings />} />
        <Route path="/form-builder" element={<FormBuilder />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/quotes/:id" element={<QuoteDetails />} />
        <Route path="/draft-orders" element={<DraftOrders />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
