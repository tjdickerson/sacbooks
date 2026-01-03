import React, {useEffect} from "react";

interface NumberInputProps {
    label: string;
    value: number;
    placeholder?: string
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    allowedDecimalPlaces?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
                                                     label,
                                                     value,
                                                     placeholder = '',
                                                     onChange,
                                                     min, max,
                                                     allowedDecimalPlaces = 2
                                                 }: NumberInputProps): React.JSX.Element => {
    const [strValue, setStrValue] = React.useState(value === 0 ? '' : value.toString());
    const [error, setError] = React.useState('');

    useEffect(() => {
        const displayValue = value === 0 ? '' : value.toString();
        if (parseFloat(strValue) !== value ||
            (value === 0 && strValue !== '')) {
            setStrValue(displayValue);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const inputValue: string = e.target.value;
        if (inputValue === '' || inputValue === '-') {
            setStrValue(inputValue);
            return;
        }
        const decimalPattern = allowedDecimalPlaces > 0
            ? `(\\.\\d{0,${allowedDecimalPlaces}})?`
            : '';
        const regex = new RegExp(`^-?\\d*${decimalPattern}$`);
        if (!regex.test(inputValue)) {
            return;
        }

        setStrValue(inputValue);
        const numeric: number = Number(inputValue);

        if (isNaN(numeric)) {
            setError('Invalid number');
            return;
        }
        if (min && numeric < min) {
            setError(`Must be greater than or equal to ${min}`);
            return;
        }
        if (max && numeric > max) {
            setError(`Must be less than or equal to ${max}`);
            return;
        }

        onChange(Number(numeric));
    }

    return (
        <div className='sac-input-container' role="textbox" aria-label={label}>
            {error && <div className='text-input-error'>{error}</div>}
            <div className='sac-input-label'>{label}</div>
            <input className='number-input'
                   type="text"
                   inputMode="decimal"
                   onChange={handleChange}
                   value={strValue}
                   placeholder={placeholder}
                   min={min} max={max}
            />
        </div>
    )
}

export default NumberInput;
