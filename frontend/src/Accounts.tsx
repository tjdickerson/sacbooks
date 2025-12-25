import { useEffect, useState } from "react";
import NewAccountForm from "./NewAccountForm";
import { AddAccount, GetAccounts } from "../wailsjs/go/main/App";
import { types as t } from "../wailsjs/go/models";
import { FaTrash } from "react-icons/fa";
import { useAccountSelection } from "./AccountContext";

function Accounts() {
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
    const [addingAccount, setAddingAccount] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [accounts, setAccounts] = useState<t.Account[]>([]);
    const { selectedAccountId, setSelectedAccountId } = useAccountSelection();

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
        let mounted = true;

        loadAccounts();

        return () => { mounted = false; }
    }, []);

    async function handleAddAccount(name: string) {
        setLoadingAccounts(true);
        setError('');

        try {
            const addResult = await AddAccount(name);
            if (addResult.success) {
                loadAccounts();
            }
            else {
                setError(addResult.message)
            }
        } finally {
            setLoadingAccounts(false);
        }

    }

    function handleSwitchAccount(id: number) {
        setSelectedAccountId(id);
    }

    return (
        <div className='view-layout accounts-view'>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {loadingAccounts && <p>Loading..</p>}

            {addingAccount ? (
                <div className='form-area'>
                    <NewAccountForm
                        onSubmit={handleAddAccount}
                        onCancel={() => setAddingAccount(false)}
                        submitting={loadingAccounts}
                        initialValues={{ name: "" }} />
                </div>
            ) : (
                <div className='view-bar'>
                    <div className='view-name'>Accounts</div>
                    <div className='view-buttons'>
                        <button
                            className='btn-primary account-new-button'
                            type="submit"
                            onClick={() => setAddingAccount(true)}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className='list-container'>
                <div className='scrollbox container accounts-list'>
                    {
                        accounts.map((account) => {
                            const selected = account.id == selectedAccountId;
                            return (
                                <div key={account.id}
                                    className={`card account-card ${selected ? "selected-account" : ""}`}>
                                    <div className='account-info'
                                        onClick={() => handleSwitchAccount(account.id)}>
                                        <div className='label account-name'>
                                            {account.name}
                                        </div>
                                        <div className='action-buttons'>
                                            <button className='danger' onClick={() => alert("no")}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )

}

export default Accounts;
