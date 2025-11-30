import './App.css';
import './transaction.css';


function getCurrencySymbol(locale) {
    const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD'
    }).formatToParts(1.0);

    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '$';

}

function getLocale() {
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language;
}

function FormatAmount(baseAmount) {
    let amount = (baseAmount / 100);
    let locale = getLocale();
    return amount.toLocaleString(locale, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function Transaction({ transaction }) {
    const isPositive = Number(transaction.Amount) >= 0;
    const amountClass = `transaction-amount ${isPositive ? 'positive' : 'negative'}`;

    return (
        <div className='transaction-card'>
            <div className='transaction-date'>{transaction.DisplayDate}</div>
            <div className='transaction-info'>
                <div className='transaction-name'>{transaction.Name}</div>
                <div className='transaction-details'>
                    <div className='transaction-amount-holder'>
                        <div className='currency-symbol'>{getCurrencySymbol(getLocale())}</div>
                        <div className={amountClass}>
                            {FormatAmount(transaction.Amount)}
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