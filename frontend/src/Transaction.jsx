import './App.css';
import './transaction.css';

import { useState } from 'react'
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { formatAmount, getCurrencySymbol, getLocale } from './lib/format';


function Transaction({ transaction, onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(transaction.Name);
    const [editAmount, setEditAmount] = useState(formatAmount(transaction.Amount));

    const isPositive = Number(transaction.Amount) >= 0;
    const amountClass = `transaction-amount ${isPositive ? 'positive' : 'negative'}`;

    const handleSave = () => {
        const amountInCents = Math.round(editAmount * 100);
        onSave(transaction.Id, editName, amountInCents);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(transaction.Name);
        setEditAmount(transaction.Amount);
        setIsEditing(false);
    }

    return (
        <div className='card'>
            <div className='transaction-date'>{transaction.DisplayDate}</div>
            <div className='transaction-info'>
                {
                    isEditing ? (
                        <>
                            <input
                                type="text"
                                className='transaction-new-input'
                                placeholder='Transaction Name'
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                aria-label="Transaction Name"
                            />
                        </>
                    )
                        :
                        (<>
                            <div className='transaction-name'>{transaction.Name}</div>
                        </>)
                }
                <div className='transaction-details'>
                    <div className='transaction-amount-holder'>
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    className='transaction-edit-input'
                                    placeholder='Amount'
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    aria-label="Transaction Amount"
                                    step="0.01" />
                            </>
                        )
                            :
                            (
                                <>
                                    <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                    <div className={amountClass}>
                                        {formatAmount(transaction.Amount)}
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
                                <button className='danger' onClick={() => onDelete(transaction.Id)}>
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

export default Transaction
