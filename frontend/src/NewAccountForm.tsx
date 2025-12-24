import { useEffect, useState } from "react";


interface NewAccountFormProps {
    onSubmit: (name: string) => Promise<void>;
    submitting: boolean;
    initialValues: { name: string };
};

const NewAccountForm: React.FC<NewAccountFormProps> = ({
    onSubmit,
    submitting: parentSubmitting,
    initialValues }) => {

    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(_: { preventDefault: () => void; }) {
        setError('');

        const nameError: string = !name.trim() ? 'Account name is required.' : '';
        const validationError = nameError;

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            onSubmit(clean_name);
            setName('');
        } catch(err) {
            setError(err?.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className='inline-form account-input-form' onSubmit={handleSubmit}>
            {error && <div className='form-error'>{error}</div>}
            <div className='form-label'>New Account</div>

            <input
                type="text"
                className='transaction-new-input'
                placeholder='Account Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Transaction Name"
            />


            <button className='btn-primary transaction-new-button' type="submit" disabled={isSubmitting}>
                Add
            </button>
        </form>
    )
};


export default NewAccountForm
