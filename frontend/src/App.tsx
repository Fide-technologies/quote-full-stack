import React from 'react';
import { AppLayoutWrapper } from './components/AppLayoutWrapper';
import { AppRoutes } from './routes/AppRoutes';

import { ErrorBoundary } from './components/guards/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppLayoutWrapper>
        <AppRoutes />
      </AppLayoutWrapper>
    </ErrorBoundary>
  );
};

export default App;