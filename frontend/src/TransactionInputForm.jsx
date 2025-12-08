import { useState, useEffect } from 'react';

function TransactionInputForm({ onSubmit, submitting: parentSubmitting, initialValues }) {
    // ensure controlled values (strings) and keep in sync if initialValues changes
    const [name, setName] = useState(initialValues?.name ?? '');
    const [amount, setAmount] = useState(
        initialValues?.amount != null ? String(initialValues.amount) : ''
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setAmount(initialValues?.amount != null ? String(initialValues.amount) : '');
    }, [initialValues]);

    const isSubmitting = parentSubmitting || submitting;

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        // simple validation (returns error message or null)
        const nameError = !name.trim() ? 'Transaction name is required.' : null;
        const amountError = isNaN(Number(amount)) ? 'Amount must be a valid number.' : null;
        const validationError = nameError || amountError;
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = {
            Name: name.trim(),
            Amount: Number(amount),
        }

        try {
            if (!parentSubmitting) setSubmitting(true);
            await onSubmit(payload);
            setName('');
            setAmount('');
        } catch (err) {
            setError(err?.message || 'Error submitting transaction');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className='transaction-input-form' onSubmit={handleSubmit}>
            {error && <div className='form-error'>{error}</div>}
            <div className='transaction-new-label'>New Transaction</div>

            <input
                type="text"
                className='transaction-new-input'
                placeholder='Transaction Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Transaction Name"
            />


            <input
                type="number"
                className='transaction-new-input'
                placeholder='Amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Transaction Amount"
                step="0.01"
            />

            <button className='transaction-new-button' type="submit" disabled={isSubmitting}>
                Add
            </button>
        </form>
    )
}

export default TransactionInputForm