import react from 'react';
import {
    AddTransaction,
    ApplyRecurring,
    DeleteTransaction,
    GetAccount,
    GetRecurringList,
    GetTransactions,
    UpdateTransaction
} from "../wailsjs/go/main/App";
import {types as t} from "../wailsjs/go/models";
import Transaction from './Transaction';
import TransactionInputForm from './TransactionInputForm';
import './App.css';
import {formatAmount, getCurrencySymbol, getLocale} from './lib/format';
import {FaArrowLeft} from 'react-icons/fa'
import {useAccountSelection} from './AccountContext';

function Transactions() {
    const [transactions, setTransactions] = react.useState<t.Transaction[]>([]);
    const [account, setAccount] = react.useState<t.Account | null>(null);
    const [recurrings, setRecurrings] = react.useState<t.Recurring[]>([]);
    const [loadingTransactions, setLoadingTransactions] = react.useState<boolean>(false);
    const [loadingRecurring, setLoadingRecurring] = react.useState<boolean>(false);
    const [error, setError] = react.useState<string>("");
    const [page, setPage] = react.useState<number>(0);
    const [hasMore, setHasMore] = react.useState<boolean>(true);
    const {selectedAccount} = useAccountSelection();
    const selectedAccountId: number = selectedAccount?.id ?? 0;

    const transactionContainerRef = react.useRef<HTMLDivElement | null>(null);
    const PAGE_SIZE: number = 20;

    async function refreshAccount() {
        try {
            const result: t.AccountResult = await GetAccount(selectedAccountId!);
            if (result.success) {
                setAccount(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Error getting account information");
        }
    }

    async function loadTransactions() {
        if (loadingTransactions || !hasMore) return;
        setLoadingTransactions(true);

        try {
            if (selectedAccount === null) {
                setError("no account info");
                return;
            }
            const result: t.TransactionListResult = await GetTransactions(selectedAccountId!, selectedAccount.active_period.id, PAGE_SIZE, page * PAGE_SIZE);

            if (result.success) {
                const data: t.Transaction[] = result.data;
                setTransactions(prev => {
                    const map = new Map<number, t.Transaction>(prev.map(t => [t.id, t]));
                    for (const t of data) {
                        map.set(t.id, t);
                    }
                    return [...map.values()];
                });

                setHasMore(data.length === PAGE_SIZE);
                setPage(prev => prev + 1);
            } else {
                setError(result.message);
            }

        } finally {
            setLoadingTransactions(false);
        }
    }

    async function loadRecurrings() {
        if (loadingRecurring) return;
        setLoadingRecurring(true);

        try {
            const result: t.RecurringListResult = await GetRecurringList(selectedAccountId!, selectedAccount?.active_period.id ?? 0);
            if (result.success) {
                const data: t.Recurring[] = result.data;
                setRecurrings(data);
            } else {
                setError(result.message);
            }

        } finally {
            setLoadingRecurring(false);
        }
    }

    react.useEffect(() => {
        setTransactions([]);
        setPage(0);
        setHasMore(true);
        setError("");

        async function init() {
            setLoadingTransactions(true);
            try {
                if (!selectedAccount) return;
                
                const [txResult, recResult, accResult] = await Promise.all([
                    GetTransactions(selectedAccountId!, selectedAccount.active_period.id, PAGE_SIZE, 0),
                    GetRecurringList(selectedAccountId!, selectedAccount.active_period.id ?? 0),
                    GetAccount(selectedAccountId!)
                ]);

                if (txResult.success) {
                    setTransactions(txResult.data);
                    setHasMore(txResult.data.length === PAGE_SIZE);
                    setPage(1);
                } else {
                    setError(txResult.message);
                }

                if (recResult.success) {
                    setRecurrings(recResult.data);
                } else {
                    setError(recResult.message);
                }

                if (accResult.success) {
                    setAccount(accResult.data);
                } else {
                    setError(accResult.message);
                }
            } finally {
                setLoadingTransactions(false);
            }
        }
        void init();
    }, [selectedAccountId]);

    react.useEffect(() => {
        const container: HTMLDivElement | null = transactionContainerRef.current;
        if (!container || loadingTransactions || !hasMore) return;

        if (container.scrollHeight <= container.clientHeight) {
            void loadTransactions();
        }
    }, [transactions, hasMore, loadingTransactions]);

    react.useEffect(() => {
        const container: HTMLDivElement | null = transactionContainerRef.current;
        if (!container) return;

        function handleScroll() {
            const scrollTop: number | undefined = container?.scrollTop;
            const scrollHeight: number | undefined = container?.scrollHeight;
            const clientHeight: number | undefined = container?.clientHeight;
            if (scrollTop !== undefined && scrollHeight !== undefined && clientHeight !== undefined) {
                if (scrollTop + clientHeight >= scrollHeight - 50) {
                    // near bottom -> load more
                    void loadTransactions();
                }
            }
        }

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [transactions, hasMore, loadingTransactions]);


    async function handleDeleteTransaction(id: number) {
        setLoadingTransactions(true);
        setError("")

        try {
            const result: t.SimpleResult = await DeleteTransaction(id);

            if (result.success) {
                setTransactions(prev => prev.filter(t => t.id !== id))
                await loadRecurrings();
            } else {
                setError(result?.message)
            }

            await refreshAccount();
        } catch (e) {
            setError('error');
        } finally {
            setLoadingTransactions(false)
        }
    }

    async function handleUpdateTransaction(id: number, name: string, amount: number) {
        setLoadingTransactions(true);
        setError("");

        const updateInput: t.TransactionUpdateInput = {
            id: id,
            name: name,
            amount: amount,
        }

        try {
            const result: t.TransactionResult = await UpdateTransaction(updateInput);

            if (result.success) {
                const updated: t.Transaction = result.data;
                setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t))
            } else {
                setError(result?.message)
            }

            await refreshAccount();
        } catch (err) {
            setError('error');
        } finally {
            setLoadingTransactions(false);
        }
    }

    async function handleAddTransaction(name: string, amount: number, categoryId: number) {
        setLoadingTransactions(true);
        setError("");

        try {
            let newTransaction: t.TransactionInsertInput = new t.TransactionInsertInput();
            newTransaction.name = name;
            newTransaction.amount = amount;
            newTransaction.account_id = selectedAccount?.id ?? 0;
            newTransaction.period_id = selectedAccount?.active_period.id ?? 0;
            newTransaction.category_id = categoryId;
            const result: t.TransactionResult = await AddTransaction(newTransaction);

            if (result.success) {
                const newTransaction: t.Transaction = result.data;
                setTransactions(prev => [newTransaction, ...prev]);
            } else {
                setError(result.message);
            }

            await refreshAccount()
        } catch (err) {
            setError('error');
        } finally {
            setLoadingTransactions(false);
        }
    }

    async function handleApplyRecurring(recurringId: number) {
        setLoadingTransactions(true);
        setError("");

        try {
            if (selectedAccount === null) {
                setError("no account info");
                return;
            }
            const result: t.TransactionResult = await ApplyRecurring(recurringId, selectedAccount.active_period.id);
            if (result.success) {
                const newTransaction: t.Transaction = result.data;
                setTransactions(prev => [newTransaction, ...prev]);
                await loadRecurrings();
            } else {
                setError(result.message);
            }

            await refreshAccount()
        } catch (err) {
            setError('error')
        } finally {
            setLoadingTransactions(false)
        }
    }

    return (
        <div className='view-layout transaction-view'>

            <div className='form-area'>
                <TransactionInputForm
                    onSubmit={handleAddTransaction}
                    submitting={loadingTransactions}
                    initialValues={{name: "", amount: 0}}/>
            </div>

            <div className='current-balance'>
                <div className='current-account-name'>
                    {account ? account.name : 'No Account'}
                </div>
                <div className='current-balance-label'>Current Balance</div>
                <div className='current-balance-amount'>
                    <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                    <div className={`balance-amount-value amount ${(account?.active_period.balance ?? 0) > 0 ? 'positive' : 'negative'}`}>
                        {account ? formatAmount(account.active_period.balance) : 'N/A'}
                    </div>
                </div>
            </div>

            <div className='scrollbox container transaction-list' ref={transactionContainerRef}>
                {error && <p style={{color: 'red'}}>Error: {error}</p>}

                <div className='card-list'>
                    {transactions.map((transaction) => (
                        <Transaction
                            key={transaction.id}
                            transaction={transaction}
                            onDelete={handleDeleteTransaction}
                            onSave={handleUpdateTransaction}
                        />
                    ))}
                </div>
            </div>

            <div className='scrollbox recurring-transaction-list'>
                <div className='card-list recurring-transaction-items'>
                    {loadingRecurring && <p>Loading..</p>}
                    {recurrings.length === 0 && <p>No Recurring Transactions</p>}
                    {recurrings.map((recurring) => {
                            return (
                                <div key={recurring.id} className='card recurring-transaction-item'>
                                    <div className='action-buttons transaction-action'>
                                        {!recurring.accounted_for && (
                                            <button onClick={() => handleApplyRecurring(recurring.id)}>
                                                <FaArrowLeft/>
                                            </button>
                                        )}
                                    </div>
                                    <div className='recurring-transaction-data'>
                                        <div className='transaction-date'>{recurring.day}</div>
                                        <div className='transaction-info'>
                                            <div
                                                className={`transaction-name ${recurring.accounted_for ? 'accounted-for' : ''}`}>{recurring.name}</div>
                                            <div className='transaction-details'>
                                                <div className='transaction-amount-holder'>
                                                    <div
                                                        className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                                    <div
                                                        className={`recurring-transaction-amount ${recurring.accounted_for ? 'accounted-for' : recurring.amount > 0 ? 'text-positive' : 'text-negative'}`}>
                                                        {formatAmount(recurring.amount)}
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
