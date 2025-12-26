import { useEffect, useState } from "react";
import { useAccountSelection } from "./AccountContext";
import { AddRecurring, DeleteRecurring, GetRecurringList, UpdateRecurring } from "../wailsjs/go/main/App";
import { types as t } from "../wailsjs/go/models";
import NewRecurringForm from "./NewRecurringForm";
import Recurring from "./Recurring";

function Recurrings() {
    const { selectedAccount } = useAccountSelection();
    const selectedAccountId = selectedAccount?.id;
    const [loadingRecurring, setLoadingRecurring] = useState(false);
    const [recurrings, setRecurrings] = useState<t.Recurring[]>([]);
    const [error, setError] = useState<string>('');
    const [addingRecurring, setAddingRecurring] = useState<boolean>(false);

    async function loadRecurrings() {
        if (loadingRecurring) return;
        setLoadingRecurring(true);

        try {
            const result: t.RecurringListResult = await GetRecurringList(selectedAccountId!, selectedAccount?.period_id ?? 0);
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

    useEffect(() => {
        async function init() {
            await loadRecurrings();
        }
        void init();
    }, [selectedAccountId]);

    async function handleAddRecurring(name: string, amount: number, day: number) {
        setLoadingRecurring(true);
        try {
            const result = await AddRecurring(selectedAccountId!, name, amount, day)
            if (result.success) {
                const newRecurring: t.Recurring = result.data;
                setRecurrings(prev => [newRecurring, ...prev]);
            } else {
                setError(result.message);
            }
        } catch {
            setError('error');
        } finally {
            setLoadingRecurring(false);
        }
    }

    async function handleDeleteRecurring(id: number) {
        setLoadingRecurring(true);
        setError("")

        try {
            const result: t.SimpleResult = await DeleteRecurring(id);

            if (result.success) {
                setRecurrings(prev => prev.filter(t => t.id !== id))
            }
            else {
                setError(result?.message)
            }

        } catch (e) {
            setError('error');
        } finally {
            setLoadingRecurring(false)
        }
    }

    async function handleUpdateRecurring(id: number, name: string, amount: number, day: number) {
        setLoadingRecurring(true);
        setError("");

        const updateInput: t.RecurringInput = {
            id: id,
            name: name,
            amount: amount,
            day: day,
        }

        try {
            const result: t.RecurringResult = await UpdateRecurring(updateInput);

            if (result.success) {
                const updated: t.Recurring = result.data;
                setRecurrings(prev => prev.map(r => r.id === updated.id ? updated : r))
            }
            else {
                setError(result?.message)
            }

        } catch (err) {
            setError('error');
        } finally {
            setLoadingRecurring(false);
        }
    }
    return (
        <div className='view-layout accounts-view'>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {loadingRecurring && <p>Loading..</p>}

            {addingRecurring ? (
                <div className='form-area'>
                    <NewRecurringForm
                        onSubmit={handleAddRecurring}
                        onCancel={() => setAddingRecurring(false)}
                        submitting={loadingRecurring}
                        initialValues={{ name: "", amount: 0, day: 1 }} />
                </div>
            ) : (
                <div className='view-bar'>
                    <div className='view-name'>Recurring Transactions</div>
                    <div className='view-buttons'>
                        <button
                            className='btn-primary account-new-button'
                            type="submit"
                            onClick={() => setAddingRecurring(true)}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className='list-container'>
                <div className='scrollbox container accounts-list'>
                    {recurrings.length > 0 ?
                        (
                            recurrings.map((recurring) => (
                                <Recurring
                                    key={recurring.id}
                                    recurring={recurring}
                                    onDelete={handleDeleteRecurring}
                                    onSave={handleUpdateRecurring}
                                />
                            ))
                        ) : (
                            <div>No recurring transactions</div>
                        )}
                </div>
            </div>
        </div>
    )

}

export default Recurrings;
