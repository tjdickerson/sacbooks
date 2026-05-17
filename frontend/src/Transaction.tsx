import './App.css';
import './transaction.css';

import {types as t} from "../wailsjs/go/models";

import React, {useState} from 'react'
import {FaEdit, FaSave, FaTimes, FaTrash} from 'react-icons/fa'
import {
    amountToCents,
    formatAmount,
    formatDisplayDate,
    getCurrencySymbol,
    getLocale,
    millisToDateString
} from './lib/format';
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";
import {getCategoryCache, getCategoryColor} from "./lib/category";
import DateInput from "./input/DateInput";
import CategorySelector from "./input/CategorySelector";

interface TransactionProps {
    transaction: t.Transaction;
    onSave: (id: number, name: string, amount: number, date: string, editCategoryId: number) => void;
    onDelete: (id: number) => void;
}

const Transaction: React.FC<TransactionProps> = ({
                                                     transaction,
                                                     onSave,
                                                     onDelete
                                                 }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(transaction.name);
    const [editDate, setEditDate] = useState<string>(millisToDateString(transaction.date));
    const [editCategoryId, setEditCategoryId] = useState<number>(transaction.category_id);
    const [editAmount, setEditAmount] = useState<number>(transaction.amount / 100);

    const categories = getCategoryCache();

    const isPositive: boolean = Number(transaction.amount) >= 0;
    const amountClass: string = `amount ${isPositive ? 'positive' : 'negative'}`;

    const handleSave = () => {
        const amountInCents: number = amountToCents(editAmount.toFixed(2));
        onSave(transaction.id, editName, amountInCents, editDate, editCategoryId);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(transaction.name);
        setEditAmount(transaction.amount / 100);
        setEditDate(millisToDateString(transaction.date));
        setEditCategoryId(transaction.category_id);
        setIsEditing(false);
    }

    return (
        <div className='card'>
            <div className='card-color-stripe' style={{backgroundColor: getCategoryColor(transaction.category_id)}}/>
            {!isEditing && <div className='card-info'>{formatDisplayDate(transaction.date)}</div>}
            <div className={`card-details ${isEditing ? 'inline-form-content' : ''}`}>
                <div className='form-fields'>
                    {
                        isEditing ? (
                            <>
                                <DateInput
                                    label='Date'
                                    value={editDate}
                                    onChange={setEditDate}
                                />
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
                                <CategorySelector
                                    label='Category'
                                    selectedId={editCategoryId}
                                    onChange={setEditCategoryId}
                                    dataSource={categories}
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
