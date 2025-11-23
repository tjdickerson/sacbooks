import './App.css';
import './transaction.css';

function Transaction({transaction}) {
    
    return (
        <div className='transaction-card'>
            <div className='transaction-info'>
                <div className='transaction-date'>{transaction.DisplayDate}</div>
                <div className='transaction-name'>{transaction.Name}</div>
            </div>
            <div className='transaction-details'>
                <div className='transaction-amount'>${transaction.Amount.toFixed(2)}</div>
            </div>
            <div className='action-buttons'>

            </div>
        </div>
    )
}

export default Transaction