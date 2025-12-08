import { useState, useEffect } from 'react';
import { GetTransactions, GetAccount, GetRecurringList } from "../wailsjs/go/main/App";
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

    useEffect(() => {
        let mounted = true;

        const parseMaybe = (v) => {
            if (typeof v === 'string') {
                try {
                    return JSON.parse(v);
                } catch {
                    return v;
                }
            }
            return v;
        };

        Promise.all([
            GetTransactions(),
            GetAccount(),
            GetRecurringList(),
        ])
            .then(([transactions, account, recurrings]) => {
                if (!mounted) return;
                const pt = parseMaybe(transactions);
                const pa = parseMaybe(account);
                const pr = parseMaybe(recurrings);

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
        
        const result = await AddTransaction(data.Name, data.Amount);
        
        // @todo, return object and check for id and prepend to existing list
        if (result.startsWith('Error:')) {
            setError(result);
        } else {
            if (result?.Id) {
                // prepend....
            }
            
            else {
                const raw = await GetTransactions();
                const parsed = parseMaybe(raw);
                setTransactions(Array.isArray(parsed) ? parsed : []);
            }
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