import React from 'react';
import { AppLayout } from './components/AppLayout';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
};

export default App;