import './App.css';
import './transaction.css';

import {types as t} from "../wailsjs/go/models";

import {useState} from 'react'
import {FaEdit, FaSave, FaTimes, FaTrash} from 'react-icons/fa'
import {amountToCents, formatAmount, getCurrencySymbol, getLocale} from './lib/format';
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";

interface TransactionProps {
    transaction: t.Transaction;
    onSave: (id: number, name: string, amount: number) => void;
    onDelete: (id: number) => void;
}

const Transaction: React.FC<TransactionProps> = ({
                                                     transaction,
                                                     onSave,
                                                     onDelete
                                                 }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(transaction.name);
    const [editAmount, setEditAmount] = useState<number>(transaction.amount / 100);

    const isPositive: boolean = Number(transaction.amount) >= 0;
    const amountClass: string = `amount ${isPositive ? 'positive' : 'negative'}`;

    const handleSave = () => {
        const amountInCents: number = amountToCents(editAmount.toFixed(2));
        onSave(transaction.id, editName, amountInCents);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(transaction.name);
        setEditAmount(transaction.amount / 100);
        setIsEditing(false);
    }

    return (
        <div className='card'>
            {!isEditing && <div className='card-info'>{transaction.display_date}</div>}
            <div className={`card-details ${isEditing ? 'form-content' : ''}`}>
                <div className='form-fields'>
                    {
                        isEditing ? (
                            <>
                                <TextInput
                                    label='Name'
                                    value={editName}
                                    placeholder='Gas Station'
                                    onChange={setEditName}
                                />
                                <NumberInput
                                    label='Amount'
                                    value={editAmount}
                                    placeholder='-2.20'
                                    onChange={setEditAmount}
                                />
                            </>
                        ) : (
                            <>
                                <div className='card-name'>{transaction.name}</div>
                                <div
                                    className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                                <div className={amountClass}>
                                    {formatAmount(transaction.amount)}
                                </div>
                            </>)
                    }
                </div>
                <div className='action-buttons'>
                    {isEditing ? (<>
                            <button onClick={handleSave}>
                                <FaSave/>
                            </button>
                            <button onClick={handleCancel}>
                                <FaTimes/>
                            </button>
                        </>)
                        : (<>
                            <button onClick={() => setIsEditing(true)}>
                                <FaEdit/>
                            </button>
                            <button className='danger' onClick={() => onDelete(transaction.id)}>
                                <FaTrash/>
                            </button>
                        </>)
                    }
                </div>
            </div>
        </div>
    )
}

export default Transaction
