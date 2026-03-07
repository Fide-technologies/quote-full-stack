import React from 'react';
import { AppLayout } from './components/AppLayout';
import { AppRoutes } from './routes/AppRoutes';

import { ErrorBoundary } from './components/guards/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </ErrorBoundary>
  );
};

export default App;