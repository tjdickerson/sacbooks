import React from "react";

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({
                                                 label,
                                                 value,
                                                 onChange,
                                             }: ColorInputProps): React.JSX.Element => {

    return (
        <div className='text-input-container' aria-label={label}>
            <div className='text-input-label'>{label}</div>
            <input type="color"
                   value={value}
                   onChange={(e) => onChange(e.target.value)}/>
        </div>
    )
}

export default ColorInput;
