import './App.css';
import {types as t} from "../wailsjs/go/models";
import React, {useState} from "react";
import {FaEdit, FaSave, FaTimes, FaTrash} from "react-icons/fa";
import {formatAmount, getCurrencySymbol, getLocale} from "./lib/format";
import TextInput from "./input/TextInput";
import NumberInput from "./input/NumberInput";

interface AccountProps {
    account: t.Account;
    selected: boolean;
    onSave: (id: number, name: string, periodStartDay: number) => void;
    onDelete: (id: number) => void;
    onSwitch: (id: number) => void;
}

const AccountCard: React.FC<AccountProps> = ({
                                                 account,
                                                 selected,
                                                 onSave,
                                                 onDelete,
                                                 onSwitch
                                             }: AccountProps): React.JSX.Element => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(account.name);
    const [editPeriodStartDay, setEditPeriodStartDay] = useState<number>(account.period_start_day);

    const isPositive: boolean = account.active_period.balance > 0;
    const amountClass: string = `amount ${isPositive ? "positive" : "negative"}`;

    function handleSwitchAccount(id: number) {
        if (isEditing) return;
        onSwitch(id);
    }

    function handleSave(e: React.MouseEvent) {
        e.stopPropagation();
        onSave(account.id, editName, editPeriodStartDay);
        setIsEditing(false);
    }

    function handleCancel(e: React.MouseEvent) {
        e.stopPropagation();
        setIsEditing(false);
    }

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        onDelete(account.id);
    }

    return (
        <div key={account.id}
             className={`card ${selected ? "selected-account" : ""}`}
             onClick={() => handleSwitchAccount(account.id)}>
            {!isEditing &&
                <div className='card-info'>
                    Period Start Day of Month: {account.period_start_day}
                </div>}
            <div className={`card-details ${isEditing ? 'inline-form-content' : ''}`}>
                <div className='form-fields'>
                    {isEditing ? (
                        <>
                            <TextInput
                                label='Name'
                                value={editName}
                                placeholder='Savings'
                                onChange={setEditName}
                            />
                            <NumberInput
                                label='Period Start Day'
                                value={editPeriodStartDay}
                                placeholder='7'
                                onChange={setEditPeriodStartDay}
                                min={1} max={31}
                                allowedDecimalPlaces={0}
                               />
                        </>
                    ) : (
                        <>
                            <div className='card-name label'>
                                {account.name}
                            </div>
                            <div
                                className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                            <div className={amountClass}>
                                {formatAmount(account.active_period.balance)}
                            </div>
                        </>
                    )}
                </div>
                <div className='action-buttons'>

                    {isEditing ? (
                        <>
                            <button type="button" onClick={handleSave}>
                                <FaSave/>
                            </button>
                            <button type="button" onClick={handleCancel}>
                                <FaTimes/>
                            </button>

                        </>
                    ) : (
                        <>
                            <button onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}>
                                <FaEdit/>
                            </button>
                            <button className='danger'
                                    disabled={!account.can_delete}
                                    onClick={handleDelete}>
                                <FaTrash/>
                            </button>

                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AccountCard;