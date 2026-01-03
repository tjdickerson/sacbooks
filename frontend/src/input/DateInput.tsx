import React from "react";

interface DateInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({
                                                 label,
                                                 value,
                                                 onChange,
                                             }: DateInputProps): React.JSX.Element => {

    return (
        <div className='sac-input-container' aria-label={label}>
            <div className='sac-input-label'>{label}</div>
            <input type="date"
                   value={value}
                   onChange={(e) => onChange(e.target.value)}/>
        </div>
    )
}

export default DateInput;
