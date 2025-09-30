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
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './lib/msal';
import { AuthProvider } from './context/AuthContext';

async function bootstrap() {
  await msalInstance.initialize();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </Provider>
        </AuthProvider>
      </MsalProvider>
    </StrictMode>,
  );
}

void bootstrap();
