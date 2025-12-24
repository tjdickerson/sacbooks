import './App.css';
import { SetStateAction, useEffect, useState } from 'react';
import Menu from "./Menu";
import Transactions from './Transactions';
import Recurrings from './Recurrings';
import Categories from './Categories';
import Accounts from './Accounts';
import { GetAccount } from '../wailsjs/go/main/App';
import { types as t } from "../wailsjs/go/models";
import { AccountContext } from './AccountContext';


function App() {
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [currentView, setCurrentView] = useState('transactions');
    const [hasAccount, setHasAccount] = useState<boolean | null>(null);

    useEffect(() => {
        async function bootstrap() {
            try {
                const result: t.AccountResult = await GetAccount();
                if (result.success) {
                    setHasAccount(true);
                    setCurrentView('transactions');
                } else {
                    setHasAccount(false);
                    setCurrentView('accounts');
                }
            } catch {
                setHasAccount(false);
                setCurrentView('accounts');
            }
        }
        
        bootstrap();
    }, []);

    function handleNavigate(viewId: SetStateAction<string>) {
        setCurrentView(viewId);
    }

    if (hasAccount === null) return ( <div>Loading...</div> );

    return (
        <AccountContext.Provider value={{ selectedAccountId, setSelectedAccountId }}>
        <div id="App">
            <header className="app-header">
                <Menu currentView={currentView} onNavigate={handleNavigate} />
            </header>
            <main id="app-content" className="app-main">
                <div className="container">
                    {currentView === 'transactions' && <Transactions />}
                    {currentView === 'recurrings' && <Recurrings />}
                    {currentView === 'categories' && <Categories />}
                    {currentView === 'accounts' && <Accounts />}
                </div>
            </main>
        </div>
        </AccountContext.Provider>
    );
}

export default App
