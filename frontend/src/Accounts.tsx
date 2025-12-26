import { useEffect, useState } from "react";
import NewAccountForm from "./NewAccountForm";
import { AddAccount, GetAccounts } from "../wailsjs/go/main/App";
import { types as t } from "../wailsjs/go/models";
import { FaTrash } from "react-icons/fa";
import { useAccountSelection } from "./AccountContext";
import { formatAmount, getCurrencySymbol, getLocale } from "./lib/format";

function Accounts() {
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
    const [addingAccount, setAddingAccount] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [accounts, setAccounts] = useState<t.Account[]>([]);
    const { selectedAccount, setSelectedAccount } = useAccountSelection();
    const selectedAccountId = selectedAccount?.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>('');
    const [editPeriodStartDay, setEditPeriodStartDay] = useState<number>(1);

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

    async function handleAddAccount(name: string) {
        setLoadingAccounts(true);
        setError('');

        try {
            // TODO: change 7 to user input for period start day
            const addResult = await AddAccount(name, 7);
            if (addResult.success) {
                await loadAccounts();
            }
            else {
                setError(addResult.message)
            }
        } finally {
            setLoadingAccounts(false);
        }

    }

    function handleSwitchAccount(id: number) {
        const account = accounts.find(a => a.id === id);
        if (account) {
            setSelectedAccount(account);
        }
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
                <div className='scrollbox container accounts-list'>
                    {
                        accounts.map((account) => {
                            const selected = account.id == selectedAccountId;
                            const isPositive: boolean = account.balance > 0;
                            const amountClass: string = `amount ${isPositive ? "positive" : "negative"}`;
                            return (
                                <div key={account.id}
                                    className={`card ${selected ? "selected-account" : ""}`}>
                                    <div className='card-info'>
                                        Period Start Day of Month: {account.period_start_day}
                                    </div>
                                    <div className='card-details'
                                        onClick={() => handleSwitchAccount(account.id)}>
                                        <div className='card-name label'>
                                            {account.name}
                                        </div>
                                        <div className='card-details'>
                                            <div className='amount-holder'>
                                                <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                                <div className={amountClass}>
                                                    {formatAmount(account.balance)}
                                                </div>
                                            </div>
                                            <div className='action-buttons'>
                                                <button className='danger' onClick={() => alert("no")}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div >
    )

}

export default Accounts;
