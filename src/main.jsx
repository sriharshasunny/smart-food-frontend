import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary';

import AppCustomer from './apps/AppCustomer';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppCustomer />
    </ErrorBoundary>
  </StrictMode>,
)
