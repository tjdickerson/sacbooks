import { useState, useEffect } from 'react';
import { amountToCents, formatAmount } from './lib/format';

interface TransactionFormProps {
    onSubmit: (name: string, amount: number) => Promise<void>;
    submitting: boolean;
    initialValues: {name: string, amount: number};
};

const TransactionInputForm: React.FC<TransactionFormProps> = ({
    onSubmit,
    submitting: parentSubmitting, 
    initialValues }) => {

    // ensure controlled values (strings) and keep in sync if initialValues changes
    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [amount, setAmount] = useState<string>(formatAmount(initialValues?.amount ?? 0));
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setAmount(formatAmount(initialValues?.amount ?? 0));
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(_e: { preventDefault: () => void; }) {
        setError("");

        // simple validation (returns error message or null)
        const nameError: string = !name.trim() ? 'Transaction name is required.' : '';
        const amountError : string = isNaN(Number(amount)) ? 'Amount must be a valid number.' : '';
        const validationError = nameError || amountError;
        if (validationError) {
            setError(validationError);
            return;
        }

        const amountInCents = amountToCents(amount);

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            const amount: number = amountInCents;
            onSubmit(clean_name, amount);
            setName('');
            setAmount('0');
        } catch (err) {
            setError('Error submitting transaction');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className='inline-form transaction-input-form' onSubmit={handleSubmit}>
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
                className='number-input transaction-new-input'
                placeholder='Amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Transaction Amount"
                step="0.01"
            />

            <button className='btn-primary transaction-new-button' type="submit" disabled={isSubmitting}>
                Add
            </button>
        </form>
    )
}

export default TransactionInputForm
