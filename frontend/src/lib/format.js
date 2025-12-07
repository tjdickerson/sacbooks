export function getCurrencySymbol(locale) {
    const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD'
    }).formatToParts(1.0);

    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '$';

}

export function getLocale() {
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language;
}

export function formatAmount(baseAmount) {
    let amount = (baseAmount / 100);
    let locale = getLocale();
    return amount.toLocaleString(locale, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}