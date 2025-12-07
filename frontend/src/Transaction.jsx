import './App.css';
import './transaction.css';

import { formatAmount, getCurrencySymbol, getLocale } from './lib/format';


function Transaction({ transaction }) {
    const isPositive = Number(transaction.Amount) >= 0;
    const amountClass = `transaction-amount ${isPositive ? 'positive' : 'negative'}`;

    return (
        <div className='card'>
            <div className='transaction-date'>{transaction.DisplayDate}</div>
            <div className='transaction-info'>
                <div className='transaction-name'>{transaction.Name}</div>
                <div className='transaction-details'>
                    <div className='transaction-amount-holder'>
                        <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                        <div className={amountClass}>
                            {formatAmount(transaction.Amount)}
                        </div>
                    </div>
                    <div className='action-buttons'>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Transaction