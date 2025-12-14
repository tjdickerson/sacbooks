import './App.css';
import './transaction.css';

import { types as t } from "../wailsjs/go/models";

import { useState } from 'react'
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { formatAmount, getCurrencySymbol, getLocale, amountToCents } from './lib/format';

interface TransactionProps {
    transaction: t.Transaction;
    onSave: (id: number, name: string, amount: number) => void;
    onDelete: (id: number) => void;
}

const Transaction: React.FC<TransactionProps> = ({
    transaction, 
    onSave, 
    onDelete }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(transaction.name);
    const [editAmount, setEditAmount] = useState<string>(formatAmount(transaction.amount));

    const isPositive: boolean = Number(transaction.amount) >= 0;
    const amountClass: string = `transaction-amount ${isPositive ? 'positive' : 'negative'}`;

    const handleSave = () => {
        const amountInCents: number = amountToCents(editAmount);
        onSave(transaction.id, editName, amountInCents);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(transaction.name);
        setEditAmount(formatAmount(transaction.amount));
        setIsEditing(false);
    }

    return (
        <div className='card'>
            <div className='transaction-date'>{transaction.display_date}</div>
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
                            <div className='transaction-name'>{transaction.name}</div>
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
                                        {formatAmount(transaction.amount)}
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
                                <button className='danger' onClick={() => onDelete(transaction.id)}>
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
