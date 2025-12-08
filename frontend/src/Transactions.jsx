import { useState, useEffect } from 'react';
import { GetTransactions, GetAccount, GetRecurringList, AddTransaction } from "../wailsjs/go/main/App";
import Transaction from './Transaction';
import TransactionInputForm from './TransactionInputForm';
import './App.css';
import { formatAmount, getCurrencySymbol, getLocale } from './lib/format';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [account, setAccount] = useState(null);
    const [recurrings, setRecurrings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // move parser out so both effect and handlers can use it
    const parseMaybe = (v) => {
        if (typeof v === 'string') {
            try { return JSON.parse(v); } catch { return v; }
        }
        return v;
    };

    useEffect(() => {
        let mounted = true;
        Promise.all([
            GetTransactions(),
            GetAccount(),
            GetRecurringList(),
        ])
            .then(([transactionsRaw, accountRaw, recurringsRaw]) => {
                if (!mounted) return;
                const pt = parseMaybe(transactionsRaw);
                const pa = parseMaybe(accountRaw);
                const pr = parseMaybe(recurringsRaw);

                setTransactions(Array.isArray(pt) ? pt : []);
                setAccount(pa && typeof pa === 'object' ? pa : null);
                setRecurrings(Array.isArray(pr) ? pr : []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err?.message || 'Error fetching data');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => { mounted = false; }
    }, []);

    async function handleAddTransaction(data) {
        setLoading(true);
        setError(null);

        try {
            const result = await AddTransaction(data.Name, data.Amount);
            const parsed = parseMaybe(result);

            // if server returned the created transaction object, prepend it
            if (parsed && typeof parsed === 'object' && (parsed.Id ?? parsed.id)) {
                console.log("Prepending new transaction", parsed);
                setTransactions(prev => [parsed, ...prev]);
            } else {
                // otherwise refetch full list to stay in sync
                console.log("Refetching transactions after add");
                const raw = await GetTransactions();
                const list = parseMaybe(raw);
                setTransactions(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.error('AddTransaction failed', err);
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='transaction-view'>
            
            <div className='transaction-new'>
                <TransactionInputForm onSubmit={handleAddTransaction} />
            </div>

            <div className='current-balance'>
                <div className='current-account-name'>
                    {account ? account.Name : 'No Account'}
                </div>
                <div className='current-balance-label'>Current Balance</div>
                <div className='current-balance-amount'>
                    <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                    <div className='balance-amount-value'>
                        {account ? formatAmount(account.CurrentBalance) : 'N/A'}
                    </div>
                </div>
            </div>

            <div className='transaction-container'>
                {loading && <p>Loading..</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                {!loading && !error && (
                    transactions.length === 0
                        ? <p>No Data</p>
                        : (
                            <div>
                                {transactions.map((transaction) => (
                                    <Transaction key={transaction.Id} transaction={transaction} />
                                ))}
                            </div>
                        )
                )}
            </div>

            <div className='recurring-transaction-list'>
                <div className='recurring-transaction-list-label'>Recurring Transactions</div>
                <div className='recurring-transaction-items'>
                    {recurrings.length === 0 && <p>No Recurring Transactions</p>}
                    {recurrings.map((recurring) => (
                        <div key={recurring.Id} className='card recurring-transaction-item'>
                            <div className='transaction-date'>{recurring.Day}</div>
                            <div className='transaction-info'>
                                <div className='transaction-name'>{recurring.Name}</div>
                                <div className='transaction-details'>
                                    <div className='transaction-amount-holder'>
                                        <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                        <div className='recurring-transaction-amount'>
                                            {formatAmount(recurring.Amount)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Transactions;