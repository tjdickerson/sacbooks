import { useState, useEffect, useMemo, useRef } from 'react';
import { GetTransactions, GetAccount, GetRecurringList, AddTransaction, DeleteTransaction, UpdateTransaction, ApplyRecurring } from "../wailsjs/go/main/App";
import Transaction from './Transaction';
import TransactionInputForm from './TransactionInputForm';
import './App.css';
import { formatAmount, getCurrencySymbol, getLocale } from './lib/format';
import { FaArrowLeft } from 'react-icons/fa'

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [account, setAccount] = useState(null);
    const [recurrings, setRecurrings] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingRecurring, setLoadingRecurring] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const transactionContainerRef = useRef(null);
    const PAGE_SIZE = 20;

    const transactionNameMap = useMemo(() => {
        return new Set(transactions.map(t => t.Name));
    }, [transactions]);


    const parseMaybe = (v) => {
        if (typeof v === 'string') {
            try { return JSON.parse(v); } catch { return v; }
        }
        return v;
    };

    async function refreshAccount() {
        try {
            const raw = await GetAccount();
            const parsed = parseMaybe(raw);
            setAccount(parsed && typeof parsed === "object" ? parsed : null);
        }
        catch (err) {
            setError(err?.Message || "Error getting account information");
        }
    }

    async function loadTransactions() {
        if (loadingTransactions || !hasMore) return;
        setLoadingTransactions(true);

        console.log("loading transactions");
        try {
            const raw = await GetTransactions(PAGE_SIZE, page * PAGE_SIZE);
            const parsed = parseMaybe(raw);
            const list = Array.isArray(parsed) ? parsed : [];

            console.log(list);

            setTransactions(prev => {
                const map = new Map(prev.map(t => [t.Id, t]));
                for (const t of list) {
                    map.set(t.Id, t);
                }
                return [...map.values()];
            });

            setHasMore(list.length === PAGE_SIZE);
            setPage(prev => prev + 1);
        } finally {
            setLoadingTransactions(false);
        }
    }

    async function loadRecurrings() {
        if (loadingRecurring) return;
        setLoadingRecurring(true);

        try {
            const raw = await GetRecurringList();
            const parsed = parseMaybe(raw);
            const list = Array.isArray(parsed) ? parsed : [];

            setRecurrings(list)
        } finally {
            setLoadingRecurring(false);
        }
    }

    useEffect(() => {
        let mounted = true;
        loadTransactions();
        loadRecurrings();
        refreshAccount();

        return () => { mounted = false; }
    }, []);

    useEffect(() => {
        const container = transactionContainerRef.current;
        if (!container) return;

        function handleScroll() {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                // near bottom -> load more
                loadTransactions();
            }
        }

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [transactions, hasMore, loadingTransactions]);

    /**
     * Deletes a transaction by ID.
     * @param {number} id - Transaction identifier
     * @returns {Promise<void>} Resolves when deletion is complete
     */
    async function handleDeleteTransaction(id) {
        setLoadingTransactions(true);
        setError(null)

        try {
            const rawResult = await DeleteTransaction(id);
            const result = parseMaybe(rawResult);
            if (result && result.Success) {
                setTransactions(prev => prev.filter(t => t.Id !== id))
            }
            else {
                setError(result?.Message)
                const raw = await GetTransactions();
                const list = parseMaybe(raw);
                setTransactions(Array.isArray(list) ? list : []);
            }
            await refreshAccount();
        } catch (e) {
            setError(e?.message || string(e));
        } finally {
            setLoadingTransactions(false)
        }
    }

    /**
     * Updates transaction with new info.
     * @param {number} id - Transaction identifier
     * @param {string} name - Transaction name
     * @param {number} amount - Transaction amount in cents
     * @returns {Promise<void>} Resolves when deletion is complete
     */
    async function handleUpdateTransaction(id, name, amount) {
        setLoadingTransactions(true);
        setError(null);

        try {
            const rawResult = await UpdateTransaction(id, name, amount);
            const result = parseMaybe(rawResult);

            if (result && result.Success) {
                const updated = result.Object;
                setTransactions(prev => prev.map(t => t.Id === updated.Id ? updated : t))
            }
            else {
                setError(result?.Message)
                const raw = await GetTransactions();
                const list = parseMaybe(raw);
                setTransactions(Array.isArray(list) ? list : []);
            }

            await refreshAccount();
        } catch (err) {
            setError(err?.Message || err);
        } finally {
            setLoadingTransactions(false);
        }
    }

    async function handleAddTransaction(data) {
        setLoadingTransactions(true);
        setError(null);

        try {
            const result = await AddTransaction(data.Name, data.Amount);
            const parsed = parseMaybe(result);

            // if server returned the created transaction object, prepend it
            if (parsed && typeof parsed === 'object' && (parsed.Id ?? parsed.id)) {
                setTransactions(prev => [parsed, ...prev]);
            } else {
                // otherwise refetch full list to stay in sync
                const raw = await GetTransactions();
                const list = parseMaybe(raw);
                setTransactions(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            setError(err?.message || String(err));
        } finally {
            setLoadingTransactions(false);
        }
    }

    async function handleApplyRecurring(recurringId) {
        console.log("what");
        setLoadingTransactions(true)
        setError(null)

        try {
            const rawResult = await ApplyRecurring(recurringId)
            const result = parseMaybe(rawResult);
            if (result && typeof result === 'object' && result.Success) {
                setTransactions(prev => [result.Object, ...prev]);
            } else {
                // otherwise refetch full list to stay in sync
                const raw = await GetTransactions();
                const list = parseMaybe(raw);
                setTransactions(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            setError(err?.Message || err)
        } finally {
            setLoadingTransactions(false)
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

            <div className='transaction-container' ref={transactionContainerRef}>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <div>
                    {transactions.map((transaction) => (
                        <Transaction
                            key={transaction.Id}
                            transaction={transaction}
                            onDelete={handleDeleteTransaction}
                            onSave={handleUpdateTransaction}
                        />
                    ))}
                </div>
            </div>

            <div className='recurring-transaction-list'>
                <div className='recurring-transaction-list-label'>Recurring Transactions</div>
                <div className='recurring-transaction-items'>
                    {loadingRecurring && <p>Loading..</p>}
                    {recurrings.length === 0 && <p>No Recurring Transactions</p>}
                    {recurrings.map((recurring) => {

                        const isAccountedFor = transactionNameMap.has(recurring.Name);

                        return (
                            <div key={recurring.Id} className='card recurring-transaction-item'>
                                <div className='action-buttons transaction-action'>
                                    <button onClick={() => handleApplyRecurring(recurring.Id)}>
                                        <FaArrowLeft />
                                    </button>
                                </div>
                                <div className='recurring-transaction-data'>
                                    <div className='transaction-date'>{recurring.Day}</div>
                                    <div className='transaction-info'>
                                        <div className={`transaction-name ${isAccountedFor ? 'accounted-for' : ''}`}>{recurring.Name}</div>
                                        <div className='transaction-details'>
                                            <div className='transaction-amount-holder'>
                                                <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                                <div className={`recurring-transaction-amount ${isAccountedFor ? 'accounted-for' : recurring.Amount > 0 ? 'text-positive' : 'text-negative'}`}>
                                                    {formatAmount(recurring.Amount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>
            </div>
        </div>
    )
}

export default Transactions;
