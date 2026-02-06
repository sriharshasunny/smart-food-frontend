import React from 'react'
import ReactDOM from 'react-dom/client'
import AppAdmin from './AppAdmin.jsx'
import '../index.css' // Reuse main styles for consistency

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppAdmin />
    </React.StrictMode>,
)
