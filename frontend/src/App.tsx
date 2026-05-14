import type React from 'react';
import { AppLayoutWrapper } from './components/AppLayoutWrapper';
import { ErrorBoundary } from './components/guards/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';

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
