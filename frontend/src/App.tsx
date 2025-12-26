import './App.css';
import { useEffect, useState } from 'react';
import Menu from "./Menu";
import Transactions from './Transactions';
import Recurrings from './Recurrings';
import Categories from './Categories';
import Accounts from './Accounts';
import { GetDefaultAccount } from '../wailsjs/go/main/App';
import { types as t } from "../wailsjs/go/models";
import { AccountContext } from './AccountContext';
import { ViewId } from './views';


function App() {
    const [selectedAccount, setSelectedAccount] = useState<t.Account | null>(null);
    const [currentView, setCurrentView] = useState<ViewId>('transactions');
    const [error, setError] = useState<string>('');


    useEffect(() => {
        async function bootstrap() {
            const result: t.AccountResult = await GetDefaultAccount();
            if (result.success) {
                setSelectedAccount(result.data);
            } else {
               setError(result.message);
            }
        }

        void bootstrap();
    }, []);

    function handleNavigate(viewId: ViewId) {
        setCurrentView(viewId);
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (selectedAccount == null || selectedAccount.id == null) {
        return <div>Loading...</div>
    }

    return (
        <AccountContext.Provider value={{ 
            selectedAccount, setSelectedAccount }}>
            <div id="App">
                <header className="app-header">
                    <Menu
                        currentView={currentView}
                        onNavigate={handleNavigate}
                    />
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
