import './App.css';

import { types as t } from "../wailsjs/go/models";

import { useState } from 'react'
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { formatAmount, getCurrencySymbol, getLocale, amountToCents } from './lib/format';

interface RecurringProps {
    recurring: t.Recurring;
    onSave: (id: number, name: string, amount: number, day: number) => void;
    onDelete: (id: number) => void;
}

const Recurring: React.FC<RecurringProps> = ({
    recurring, 
    onSave, 
    onDelete }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(recurring.name);
    const [editAmount, setEditAmount] = useState<string>((recurring.amount / 100).toFixed(2));
    const [editDay, setEditDay] = useState<number>(recurring.day);

    const isPositive: boolean = Number(recurring.amount) >= 0;
    const amountClass: string = `amount ${isPositive ? 'positive' : 'negative'}`;

    const handleSave = () => {
        const amountInCents: number = amountToCents(editAmount);
        onSave(recurring.id, editName, amountInCents, editDay);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(recurring.name);
        setEditAmount((recurring.amount / 100).toFixed(2));
        setEditDay(recurring.day);
        setIsEditing(false);
    }

    return (
        <div className='card'>
            <div className='card-info'>{recurring.day}</div>
            <div className='card-details'>
                {
                    isEditing ? (
                        <>
                            <input
                                type="text"
                                className='transaction-new-input'
                                placeholder='Recurring Name'
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                aria-label="Recurring Name"
                            />
                        </>
                    )
                        :
                        (<>
                            <div className='card-name'>{recurring.name}</div>
                        </>)
                }
                <div className='card-details'>
                    <div className='amount-holder'>
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    className='number-input'
                                    placeholder='Amount'
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    aria-label="Recurring Amount"
                                    step="0.01" />

                                <input
                                    type="number"
                                    className='transaction-edit-input'
                                    placeholder='Day of month'
                                    value={editDay}
                                    onChange={(e) => setEditDay(Number(e.target.value))}
                                    aria-label="Day of month"
                                    step="1"
                                    min="1"
                                    max="31"
                                    />
                            </>
                        )
                            :
                            (
                                <>
                                    <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                    <div className={amountClass}>
                                        {formatAmount(recurring.amount)}
                                    </div>
                                </>
                            )
                        }
                    </div>
                    <div className='action-buttons'>
                        {isEditing ? (<>
                            <button onClick={handleSave}>
                                <FaSave />
                            </button>
                            <button onClick={handleCancel}>
                                <FaTimes />
                            </button>
                        </>)
                            : (<>
                                <button onClick={() => setIsEditing(true)}>
                                    <FaEdit />
                                </button>
                                <button className='danger' onClick={() => onDelete(recurring.id)}>
                                    <FaTrash />
                                </button>
                            </>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Recurring
