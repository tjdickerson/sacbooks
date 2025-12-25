
import { useEffect, useState } from "react";
import { amountToCents, formatAmount } from "./lib/format";


interface NewRecurringFormProps {
    onSubmit: (name: string, amount: number, day: number) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
    initialValues: { name: string, amount: number, day: number };
};

const NewRecurringForm: React.FC<NewRecurringFormProps> = ({
    onSubmit,
    onCancel,
    submitting: parentSubmitting,
    initialValues }) => {

    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [amount, setAmount] = useState<string>(formatAmount(initialValues?.amount ?? 0));
    const [day, setDay] = useState<number>(1);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setAmount(formatAmount(initialValues?.amount ?? 0));
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        // simple validation (returns error message or null)
        const nameError: string = !name.trim() ? 'Transaction name is required.' : '';
        const amountError : string = isNaN(Number(amount)) ? 'Amount must be a valid number.' : '';
        const dayError : string = isNaN(Number(amount)) || day < 1 || day > 31 ? 'Day must be a day of a month.' : '';
        const validationError = nameError || amountError || dayError;
        if (validationError) {
            setError(validationError);
            return;
        }

        const amountInCents = amountToCents(amount);

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            await onSubmit(clean_name, amountInCents, day);
            setName('');
            setAmount('0');
            setDay(1);
        } catch(err) {
            setError('error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancel() {
        setName('');
        setSubmitting(false);
        onCancel();
    }

    return (
        <form className='inline-form recurring-input-form' onSubmit={handleSubmit}>
            {error && <div className='form-error'>{error}</div>}
            <div className='form-label'>New Recurring Transaction</div>

            <input
                type="text"
                className='transaction-new-input'
                placeholder='Account Name'
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

            <input
                type="number"
                className='number-input transaction-new-input'
                placeholder='7'
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                aria-label="Transaction Day"
                step="1"
                min="1"
                max="31"
            />

            <button className='btn-primary' type="submit" disabled={isSubmitting}>
                Add
            </button>
            <button className='btn-danger' disabled={isSubmitting} onClick={handleCancel}>
                Cancel
            </button>
        </form>
    )
};


export default NewRecurringForm
