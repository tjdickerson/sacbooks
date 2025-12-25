import { useEffect, useState } from "react";
import { useAccountSelection } from "./AccountContext";
import { AddRecurring, GetRecurringList } from "../wailsjs/go/main/App";
import { types as t } from "../wailsjs/go/models";
import NewRecurringForm from "./NewRecurringForm";
import { FaTrash } from "react-icons/fa";

function Recurrings() {
    const { selectedAccountId } = useAccountSelection();
    const [loadingRecurring, setLoadingRecurring] = useState(false);
    const [recurrings, setRecurrings] = useState<t.Recurring[]>([]);
    const [error, setError] = useState<string>('');
    const [addingRecurring, setAddingRecurring] = useState<boolean>(false);

    async function loadRecurrings() {
        if (loadingRecurring) return;
        setLoadingRecurring(true);

        try {
            const result: t.RecurringListResult = await GetRecurringList(selectedAccountId!);
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
        let mounted = true;
        loadRecurrings();

        return () => { mounted = false; }
    }, []);

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
                            recurrings.map((recurring) => {
                                return (
                                    <div key={recurring.id}
                                        className='card transaction-card'>
                                        <div className='transaction-info'>
                                            <div className='label transaction-name'>
                                                {recurring.name}
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
                        ) : (
                            <div>No recurring transactions</div>
                        )}
                </div>
            </div>
        </div>
    )

}

export default Recurrings;
