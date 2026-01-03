import './App.css';

import {types as t} from "../wailsjs/go/models";

import React, {useState} from 'react'
import {FaEdit, FaSave, FaTimes, FaTrash} from 'react-icons/fa'
import {amountToCents, formatAmount, getCurrencySymbol, getLocale} from './lib/format';
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";
import CategorySelector from "./input/CategorySelector";
import {getCategoryCache, getCategoryColor} from "./lib/category";

interface RecurringCardProps {
    recurring: t.Recurring;
    onSave: (id: number, name: string, amount: number, day: number, category: number) => void;
    onDelete: (id: number) => void;
}

const RecurringCard: React.FC<RecurringCardProps> = ({
                                                         recurring,
                                                         onSave,
                                                         onDelete
                                                     }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(recurring.name);
    const [editAmount, setEditAmount] = useState<number>(recurring.amount / 100);
    const [editCategoryId, setCategoryId] = useState<number>(recurring.category_id);
    const [editDay, setEditDay] = useState<number>(recurring.day);

    const categories = getCategoryCache();

    const isPositive: boolean = Number(recurring.amount) >= 0;
    const amountClass: string = `amount ${isPositive ? 'positive' : 'negative'}`;

    const handleSave = () => {
        const amountInCents: number = amountToCents(editAmount.toFixed(2));
        onSave(recurring.id, editName, amountInCents, editDay, editCategoryId);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setEditName(recurring.name);
        setEditAmount(recurring.amount / 100);
        setEditDay(recurring.day);
        setIsEditing(false);
    }

    return (
        <div className='card' key={recurring.id}>
            <div className='card-color-stripe' style={{backgroundColor: getCategoryColor(recurring.category_id)}}/>
            {!isEditing && (<div className='card-info'>{recurring.day}</div>)}
            <div className={`card-details ${isEditing ? 'inline-form-content' : ''}`}>
                <div className='form-fields'>
                    {
                        isEditing ? (
                            <>
                                <TextInput
                                    label="Name"
                                    value={editName}
                                    onChange={setEditName}
                                    placeholder='Internet Bill'
                                />
                                <NumberInput
                                    label='Amount'
                                    value={editAmount}
                                    onChange={setEditAmount}
                                    placeholder='-85.00'
                                />
                                <NumberInput
                                    label='Transaction Date'
                                    value={editDay}
                                    placeholder='7'
                                    onChange={setEditDay}
                                    min={1} max={31}
                                    allowedDecimalPlaces={0}
                                />
                                <CategorySelector
                                    label='Category'
                                    selectedId={editCategoryId}
                                    onChange={setCategoryId}
                                    dataSource={categories}
                                />

                            </>
                        ) : (
                            <>
                                <div className='card-name label'>{recurring.name}</div>
                                <div
                                    className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
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
                            <button className='danger' onClick={() => onDelete(recurring.id)}>
                                <FaTrash/>
                            </button>
                        </>)
                    }
                </div>
            </div>
        </div>
    )
}

export default RecurringCard
