import React from 'react'
import {createRoot} from 'react-dom/client'

// Import CSS in order: Global → Layout → Components → Specific
import './style.css'
import './App.css'
import './components.css'
import './transaction.css'
import './account.css'

import App from './App'

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
