import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary';

import AppCustomer from './apps/AppCustomer';
import AppRestaurant from './apps/AppRestaurant';
import AppAdmin from './admin/AppAdmin';

const APP_TYPE = import.meta.env.VITE_APP_TYPE || 'CUSTOMER';

const CurrentApp = () => {
  switch (APP_TYPE) {
    case 'ADMIN':
      return <AppAdmin />;
    case 'RESTAURANT':
      return <AppRestaurant />;
    case 'CUSTOMER':
    default:
      return <AppCustomer />;
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <CurrentApp />
    </ErrorBoundary>
  </StrictMode>,
)
