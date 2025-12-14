import './App.css';
import { useState } from 'react';
import Menu from "./Menu";
import Transactions from './Transactions';
import Recurrings from './Recurrings';
import Categories from './Categories';


function App() {

    const [currentView, setCurrentView] = useState('transactions');

    
    function handleNavigate(viewId) {
        setCurrentView(viewId);
    }

    return (
        <div id="App">
            <header className="app-header">
                <Menu currentView={currentView} onNavigate={handleNavigate} />
            </header>
            <main id="app-content" className="app-main">
                <div className="container">
                    {currentView === 'transactions' && <Transactions />}
                    {currentView === 'recurrings' && <Recurrings />}
                    {currentView === 'categories' && <Categories />}
                </div>
            </main>
        </div>
    )
}

export default App
