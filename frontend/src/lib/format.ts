export function getCurrencySymbol(locale: Intl.LocalesArgument): string {
    const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD'
    }).formatToParts(1.0);

    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '$';

}

export function getLocale(): string {
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language;
}

export function formatAmount(baseAmount: number): string {
    let amount = (baseAmount / 100);
    let locale = getLocale();
    return amount.toLocaleString(locale, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

export function amountToCents(formattedAmount: string): number {
    const result: number = Number(formattedAmount)
    return Math.round(result * 100)
}


export function millisToDateString(millis: number): string {
    return new Date(millis).toISOString().split('T')[0];
}

export function dateStringToMillis(dateString: string): number {
    return new Date(dateString).getTime();
}