import React, {useEffect, useState} from "react";
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";


interface NewAccountFormProps {
    onSubmit: (name: string, periodStartDay: number) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
    initialValues: { name: string, periodStartDay: number };
}

const NewAccountForm: React.FC<NewAccountFormProps> = ({
                                                           onSubmit,
                                                           onCancel,
                                                           submitting: parentSubmitting,
                                                           initialValues
                                                       }) => {

    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [periodStartDay, setPeriodStartDay] = useState<number>(7);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setPeriodStartDay(7);
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const nameError: string = !name.trim() ? 'Account name is required.' : '';
        const dayError: string = periodStartDay < 1 || periodStartDay > 31 ? 'Period start day must be a day of a month.' : '';
        const validationError = nameError || dayError;

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            await onSubmit(clean_name, periodStartDay);
            setName('');
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
            <div className='form-header'>New Account</div>

            <div className='form-content'>
                <div className='form-fields'>
                    <TextInput
                        label='Account Name'
                        value={name}
                        onChange={setName}
                        placeholder='Name'
                    />

                    <NumberInput
                        label='Period Start Day'
                        value={periodStartDay}
                        onChange={setPeriodStartDay}
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


export default NewAccountForm
