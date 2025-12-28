import {useEffect, useState} from "react";
import NewAccountForm from "./NewAccountForm";
import {AddAccount, DeleteAccount, GetAccounts, UpdateAccount} from "../wailsjs/go/main/App";
import {types as t} from "../wailsjs/go/models";
import {useAccountSelection} from "./AccountContext";
import AccountCard from "./AccountCard";

function Accounts() {
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
    const [addingAccount, setAddingAccount] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [accounts, setAccounts] = useState<t.Account[]>([]);
    const {selectedAccount, setSelectedAccount} = useAccountSelection();
    const selectedAccountId = selectedAccount?.id;

    async function loadAccounts() {
        if (loadingAccounts) return;
        setLoadingAccounts(true);
        setError('');

        try {
            const results: t.AccountListResult = await GetAccounts();
            if (results.success) {
                const data: t.Account[] = results.data;
                if (data.length > 0) {
                    setAccounts(data);
                } else {
                    setAddingAccount(true);
                }

            } else {
                setError(results.message);
            }
        } finally {
            setLoadingAccounts(false);
        }
    }

    useEffect(() => {
        async function init() {
            await loadAccounts();
        }

        void init();
    }, [selectedAccountId]);

    async function handleAddAccount(name: string, periodStartDay: number): Promise<void> {
        setLoadingAccounts(true);
        setError('');

        try {
            const addResult: t.AccountResult = await AddAccount(name, periodStartDay);
            if (addResult.success) {
                await loadAccounts();
            } else {
                setError(addResult.message)
            }
        } finally {
            setLoadingAccounts(false);
        }

    }

    async function handleSwitchAccount(id: number): Promise<void> {
        const account = accounts.find(a => a.id === id);
        if (account) {
            setSelectedAccount(account);
        }
    }

    async function handleSave(accountId: number, name: string, periodStartDay: number): Promise<void> {
        setLoadingAccounts(true);
        setError('');

        try {
            const input: t.AccountUpdateInput = {name: name, period_start_day: periodStartDay};
            const result: t.AccountResult = await UpdateAccount(accountId, input)

            if (result.success) {
                await loadAccounts();
            } else {
                setError(result.message)
            }
        } finally {
            setLoadingAccounts(false);
        }
    }

    async function handleDelete(accountId: number) {
        setLoadingAccounts(true);
        setError('');

        // TODO: need to add something different here maybe.
        if(!confirm('Are you sure you want to delete this account?')) {
            setLoadingAccounts(false);
            return;
        }

        try {
            const result: t.SimpleResult = await DeleteAccount(accountId)

            if (result.success) {
                await loadAccounts();
            } else {
                setError(result.message)
            }
        } finally {
            setLoadingAccounts(false);
        }
    }

    return (
        <div className='view-layout accounts-view'>
            {loadingAccounts && <p>Loading..</p>}

            {addingAccount ? (
                <div className='form-area'>
                    <NewAccountForm
                        onSubmit={handleAddAccount}
                        onCancel={() => setAddingAccount(false)}
                        submitting={loadingAccounts}
                        initialValues={{name: "", periodStartDay: 7}}/>
                </div>
            ) : (
                <div className='view-bar'>
                    <div className='view-name'>Accounts</div>
                    <div className='view-buttons'>
                        <button
                            type='button'
                            className='btn-primary account-new-button'
                            onClick={() => setAddingAccount(true)}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className='list-container'>
                {error && <p style={{color: 'red'}}>Error: {error}</p>}
                <div className='scrollbox card-list container accounts-list'>
                    {accounts.map((account) => (
                        <AccountCard key={account.id}
                                     account={account}
                                     selected={selectedAccountId === account.id}
                                     onSwitch={() => handleSwitchAccount(account.id)}
                                     onDelete={() => handleDelete(account.id)}
                                     onSave={handleSave}
                        />
                    ))}
                </div>
            </div>
        </div>
    )

}

export default Accounts

