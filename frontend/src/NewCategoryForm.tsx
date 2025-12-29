import React, {useEffect, useState} from "react";
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";
import ColorInput from "./input/ColorInput";


interface NewCategoryProps {
    onSubmit: (name: string, color: string) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
    initialValues: { name: string, color: string };
};

const NewCategoryForm: React.FC<NewCategoryProps> = ({
                                                         onSubmit,
                                                         onCancel,
                                                         submitting: parentSubmitting,
                                                         initialValues
                                                     }) => {

    const [name, setName] = useState<string>(initialValues?.name ?? '');
    const [color, setColor] = useState<string>(initialValues?.color ?? '');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setName(initialValues?.name ?? '');
        setColor(initialValues?.color ?? '');
    }, [initialValues]);

    const isSubmitting: boolean = parentSubmitting || submitting;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const nameError: string = !name.trim() ? 'Account name is required.' : '';
        const colorError: string = !color.trim() ? 'Color required.' : '';
        const validationError = nameError || colorError;

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (!parentSubmitting) setSubmitting(true);
            const clean_name: string = name.trim();
            const clean_color: string = color.trim();
            await onSubmit(clean_name, clean_color);
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
                        label='Category Name'
                        value={name}
                        onChange={setName}
                        placeholder='Name'
                    />

                    <ColorInput
                        label='Category Color'
                        value={color}
                        onChange={setColor}
                    />

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


export default NewCategoryForm
