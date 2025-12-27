import './App.css';
import {types as t} from "../wailsjs/go/models";
import React, {useState} from "react";
import {FaEdit, FaSave, FaTimes, FaTrash} from "react-icons/fa";
import {formatAmount, getCurrencySymbol, getLocale} from "./lib/format";

interface AccountProps {
    account: t.Account;
    selected: boolean;
    onSave: (id: number, name: string, periodStartDay: number) => void;
    onDelete: (id: number) => void;
    onSwitch: (id: number) => void;
}

const AccountCard: React.FC<AccountProps> = ({account, selected, onSave, onDelete, onSwitch}: AccountProps): React.JSX.Element => {

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState<string>(account.name);
    const [editPeriodStartDay, setEditPeriodStartDay] = useState<number>(account.period_start_day);

    const isPositive: boolean = account.balance > 0;
    const amountClass: string = `amount ${isPositive ? "positive" : "negative"}`;

    function handleSwitchAccount(id: number) {
        onSwitch(id);
    }

    function handleSave() {
        onSave(account.id, editName, editPeriodStartDay);
        setIsEditing(false);
    }

    function handleCancel() {
        setIsEditing(false);
    }

    return (
        <div key={account.id}
             className={`card ${selected ? "selected-account" : ""}`}>
            {isEditing ? (<>
            </>) : (<>
                <div className='card-info'>
                    Period Start Day of Month: {account.period_start_day}
                </div>
            </>)}
            {isEditing ? (<>
                <div className='card-details'>
                    <div className='card-name'>
                        <input
                            type="text"
                            className='transaction-new-input'
                            placeholder='Account Name'
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            aria-label="Account Name"
                        />
                    </div>
                    <div className='card-details'>
                        <input
                            type="number"
                            className='number-input'
                            placeholder='Amount'
                            value={editPeriodStartDay}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setEditPeriodStartDay(value);
                            }}
                            aria-label="Period Start Day"
                            step="1"
                            min="1" max="31"/>
                        <div className='action-buttons'>
                            <button type="button" onClick={handleSave}>
                                <FaSave/>
                            </button>
                            <button type="button" onClick={handleCancel}>
                                <FaTimes/>
                            </button>
                        </div>
                    </div>
                </div>
            </>) : (<>
                <div className='card-details'
                     onClick={() => handleSwitchAccount(account.id)}>
                    <div className='card-name label'>
                        {account.name}
                    </div>
                    <div className='card-details'>
                        <div className='amount-holder'>
                            <div
                                className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                            <div className={amountClass}>
                                {formatAmount(account.balance)}
                            </div>
                        </div>
                        <div className='action-buttons'>
                            <button onClick={() => setIsEditing(true)}>
                                <FaEdit/>
                            </button>
                            {account.can_delete && (<>
                                <button className='danger'
                                        onClick={() => alert("no")}>
                                    <FaTrash/>
                                </button>
                            </>)}
                        </div>
                    </div>
                </div>
            </>)}
        </div>
    )
}

export default AccountCard;