import './App.css';
import {useEffect, useState} from 'react';
import Menu from "./Menu";
import Transactions from './Transactions';
import Recurrings from './Recurrings';
import Categories from './Categories';
import Accounts from './Accounts';
import {GetDefaultAccount} from '../wailsjs/go/main/App';
import {types as t} from "../wailsjs/go/models";
import {AccountContext} from './AccountContext';
import {ViewId} from './views';
import {refreshCategoryCache} from "./lib/category";


function App() {
    const [selectedAccount, setSelectedAccount] = useState<t.Account | null>(null);
    const [currentView, setCurrentView] = useState<ViewId>('transactions');
    const [error, setError] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }

    useEffect(() => {
        async function bootstrap() {
            const result: t.AccountResult = await GetDefaultAccount();
            if (result.success) {
                const account: t.Account = result.data;
                setSelectedAccount(account);
            } else {
                setError(result.message);
            }
        }

        void bootstrap();
    }, []);

    useEffect(() => {
        if (selectedAccount?.id) {
            void refreshCategoryCache(selectedAccount?.id ?? 1);
        }
    }, [selectedAccount?.id]);

    function handleNavigate(viewId: ViewId) {
        setCurrentView(viewId);
    }


    const handleSetSelectedAccount = async (account: t.Account | null) => {
        setSelectedAccount(account);
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (selectedAccount == null || selectedAccount.id == null) {
        return <div>Loading...</div>
    }

    return (
        <AccountContext.Provider value={{
            selectedAccount, setSelectedAccount: handleSetSelectedAccount
        }}>
            <div id="App" data-theme={theme} className="app-layout">
                <header className="app-header">
                    <Menu
                        currentView={currentView}
                        onNavigate={handleNavigate}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                    />
                </header>
                <main id="app-content" className="app-main">
                    <div className="container">
                        {currentView === 'transactions' && <Transactions/>}
                        {currentView === 'recurrings' && <Recurrings/>}
                        {currentView === 'categories' && <Categories/>}
                        {currentView === 'accounts' && <Accounts/>}
                    </div>
                </main>
            </div>
        </AccountContext.Provider>
    );
}

export default App
