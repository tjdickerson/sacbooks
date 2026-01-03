import React from 'react';

interface TextInputProps {
    label: string;
    value: string;
    placeholder?: string
    onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({
                                                 label,
                                                 value,
                                                 placeholder = '',
                                                 onChange,
                                             }: TextInputProps): React.JSX.Element => {

    return (
        <div className='sac-input-container' role="textbox" aria-label={label}>
            <div className='sac-input-label'>{label}</div>
            <input type="text"
                   value={value}
                   placeholder={placeholder}
                   onChange={(e) => onChange(e.target.value)}/>
        </div>
    )
}

export default TextInput;