// src/App.tsx
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import DrawerAppBar from '../common/components/DrawerAppbar';
import { routes, NotFoundPage } from '../app/routes';
import ErrorBoundary from '../common/components/ErrorBoundary';

// Loading component for Suspense
const Loading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
);

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <ErrorBoundary>
      {!isHomePage && <DrawerAppBar />}
      <Suspense fallback={<Loading />}>
        <Routes>
          {routes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
          {/* 404 Not Found route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <DialogsProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </DialogsProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <CssBaseline>
      <App />
    </CssBaseline>
  );
}

export default App;