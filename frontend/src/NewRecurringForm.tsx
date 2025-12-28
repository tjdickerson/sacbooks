import {useEffect, useState} from "react";
import {amountToCents} from "./lib/format";
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";


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
                                                               initialValues
                                                           }) => {

    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [amount, setAmount] = useState<number>(initialValues?.amount ?? 0);
    const [day, setDay] = useState<number>(1);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setAmount(initialValues?.amount ?? 0);
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        // simple validation (returns error message or null)
        const nameError: string = !name.trim() ? 'Transaction name is required.' : '';
        const amountError: string = isNaN(Number(amount)) ? 'Amount must be a valid number.' : '';
        const dayError: string = isNaN(Number(day)) || day < 1 || day > 31 ? 'Day must be a day of a month.' : '';
        const validationError = nameError || amountError || dayError;
        if (validationError) {
            setError(validationError);
            return;
        }

        const amountInCents = amountToCents(amount.toFixed(2));

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            await onSubmit(clean_name, amountInCents, day);
            setName('');
            setAmount(0);
            setDay(1);
        } catch (err) {
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
        <form className='inline-form' onSubmit={handleSubmit}>
            {error && <div className='form-error'>{error}</div>}
            <div className='form-header form-label'>New Recurring Transaction</div>

            <div className='form-content'>
                <div className='form-fields'>
                    <TextInput
                        label='Recurring Name'
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

                    <NumberInput
                        label='Day'
                        value={day}
                        onChange={setDay}
                        min={1} max={31}
                        placeholder='21'/>

                </div>

                <div className='form-action-area'>
                    <button className='btn-primary' type="submit" disabled={isSubmitting}>
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
};


export default NewRecurringForm
