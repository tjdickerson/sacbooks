import { useState, useEffect } from 'react';
import { types as t } from "../wailsjs/go/models";

interface TransactionFormProps {
    onSubmit: (name: string, amount: number) => void;
    submitting: boolean;
    initialValues: t.Transaction;
}

const TransactionInputForm: React.FC<TransactionFormProps> = ({
    onSubmit,
    submitting:
    parentSubmitting, initialValues }) => {

    // ensure controlled values (strings) and keep in sync if initialValues changes
    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [amount, setAmount] = useState<number>(initialValues?.amount != null ? initialValues.amount : 0);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setAmount(initialValues?.amount != null ? initialValues.amount : 0);
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // simple validation (returns error message or null)
        const nameError: string = !name.trim() ? 'Transaction name is required.' : '';
        const amountError : string = isNaN(Number(amount)) ? 'Amount must be a valid number.' : '';
        const validationError = nameError || amountError;
        if (validationError) {
            setError(validationError);
            return;
        }

        const amountInCents = Math.round(amount * 100);

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            const amount: number = amountInCents;
            onSubmit(clean_name, amount);
            setName('');
            setAmount(0);
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
                onChange={(e) => setAmount(Number(e.target.value))}
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
