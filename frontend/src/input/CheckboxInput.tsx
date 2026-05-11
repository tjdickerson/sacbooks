import React from 'react';

interface CheckboxInputProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
                                                         label,
                                                         value,
                                                         onChange,
                                                     }: CheckboxInputProps): React.JSX.Element => {

    return (
        <div className='sac-input-container'>
            <div className='sac-input-label'>{label}</div>
            <div className='sac-checkbox-row'>
                <label className="sac-switch">
                    <input type="checkbox"
                           checked={value}
                           onChange={(e) => onChange(e.target.checked)}/>
                    <span className="sac-slider"></span>
                </label>
            </div>
        </div>
    )
}

export default CheckboxInput;
