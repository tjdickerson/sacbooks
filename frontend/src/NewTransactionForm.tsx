import React, {useEffect, useState} from 'react';
import {amountToCents} from './lib/format';
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";
import CategorySelector from "./input/CategorySelector";
import {getCategoryCache} from "./lib/category";
import DateInput from "./input/DateInput";

interface NewTransactionFormProps {
    onSubmit: (name: string, amount: number, date: string, categoryId: number) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
    initialValues: { name: string, amount: number, date: string };
}

const NewTransactionForm: React.FC<NewTransactionFormProps> = ({
                                                                   onSubmit,
                                                                   onCancel,
                                                                   submitting: parentSubmitting,
                                                                   initialValues
                                                               }) => {

    const [date, setDate] = useState<string>(initialValues?.date ?? '');
    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [amount, setAmount] = useState<number>(initialValues?.amount ?? 0.00);
    const [categoryId, setCategoryId] = useState<number>(0);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setAmount(initialValues?.amount ?? 0.00);
        setCategoryId(0);
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;
    const categories = getCategoryCache();

    async function handleCancel() {
        setName(initialValues?.name ?? '');
        setAmount(initialValues?.amount ?? 0.00);
        setSubmitting(false);
        onCancel();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        // simple validation (returns error message or null)
        const nameError: string = !name.trim() ? 'Transaction name is required.' : '';
        const amountError: string = isNaN(Number(amount)) ? 'Amount must be a valid number.' : '';
        const validationError = nameError || amountError;
        if (validationError) {
            setError(validationError);
            return;
        }

        const amountInCents = amountToCents(amount.toFixed(2));

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            await onSubmit(clean_name, amountInCents, date, categoryId);
            setName('');
            setAmount(0);
            setCategoryId(0);
        } catch (err) {
            setError('Error submitting transaction');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className='inline-form' onSubmit={handleSubmit}>
            {error && <div className='form-error'>{error}</div>}
            <div className='form-header'>New Transaction</div>

            <div className='form-content'>
                <div className='form-fields'>
                    <DateInput
                        label='Transaction Date'
                        value={date}
                        onChange={setDate}
                    />

                    <TextInput
                        label='Transaction Name'
                        value={name}
                        onChange={setName}
                        placeholder='Name'
                    />

                    <NumberInput
                        label='Amount'
                        value={amount}
                        onChange={setAmount}
                        placeholder='0.00'
                    />

                    <CategorySelector
                        label='Category'
                        selectedId={categoryId}
                        onChange={setCategoryId}
                        dataSource={categories}
                    />
                </div>

                <div className='form-action-area'>
                    <button className='btn-primary transaction-new-button' type="submit"
                            disabled={isSubmitting}>
                        Add
                    </button>
                    <button className='btn-danger' type="button" disabled={isSubmitting}
                            onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    )
}

export default NewTransactionForm
