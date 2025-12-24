import { useEffect, useState } from "react";
import NewAccountForm from "./NewAccountForm";
import { AddAccount, GetAccounts } from "../wailsjs/go/main/App";
import { types as t } from "../wailsjs/go/models";

function Accounts() {
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [accounts, setAccounts] = useState<t.Account[]>([]);

    async function loadAccounts() {
        setLoadingAccounts(true);
        setError('');

        try {
            const results: t.AccountListResult = await GetAccounts();
            if (results.success) {
                const data: t.Account[] = results.data;
                setAccounts(data);
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

    return (
        <div className='view-layout accounts-view'>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <div className='form-area'>
                <NewAccountForm
                    onSubmit={handleAddAccount}
                    submitting={loadingAccounts}
                    initialValues={{ name: "" }} />
            </div>

            {loadingAccounts && <p>Loading..</p>}
            <div className='list-container'>
                <div className='view-bar'>
                    <div className='view-name'>Accounts</div>
                    <div className='view-buttons'>
                        <button className='btn-primary account-new-button' type="submit">
                            Add
                        </button>
                    </div>
                </div>
                <div className='scrollbox container accounts-list'>
                    {
                        accounts.map((account) => {
                            return (
                                <div className='card'>
                                    <div className='label account-name'>{account.name}</div>
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
