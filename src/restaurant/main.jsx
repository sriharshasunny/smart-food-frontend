import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRestaurant from '../apps/AppRestaurant.jsx' // Correct import path
import '../index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppRestaurant />
    </React.StrictMode>,
)
