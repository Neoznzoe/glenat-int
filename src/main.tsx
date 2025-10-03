import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { store } from './store';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { startMockServer } from './lib/mockServer';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './lib/msal';
import { AuthProvider } from './context/AuthContext';

async function bootstrap() {
  await msalInstance.initialize();
  await startMockServer();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Provider store={store}>
              <ThemeProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ThemeProvider>
            </Provider>
          </AuthProvider>
        </QueryClientProvider>
      </MsalProvider>
    </StrictMode>,
  );
}

void bootstrap();
