export function getCurrency(locale: string): string {
    try {
        const parts = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD', // Placeholder to get the format
        }).formatToParts(1);
        
        // This is a heuristic. In many cases we might want to let the user choose their currency,
        // but for a simple "display as yen if locale is Japan", we can infer it.
        if (locale.includes('JP')) return 'JPY';
        
        // Defaulting to USD if not specifically handled, or we could try to resolve via Intl.DisplayNames if available
        return 'USD';
    } catch (e) {
        return 'USD';
    }
}

export function getCurrencySymbol(locale: string): string {
    const currency = getCurrency(locale);
    const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).formatToParts(1.0);

    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : (currency === 'JPY' ? '¥' : '$');
}

export function getLocale(): string {
    // return 'ja-JP';
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language;
}

export function formatAmount(baseAmount: number): string {
    const locale = getLocale();
    const currency = getCurrency(locale);
    
    // JPY doesn't use subunits in this application's context as per user feedback
    const amount = currency === 'JPY' ? baseAmount : baseAmount / 100;
    
    // We use currency style but strip the symbol to match existing UI usage 
    // where the symbol is often in a separate element.
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    });

    const parts = formatter.formatToParts(amount);
    return parts
        .filter(part => part.type !== 'currency')
        .map(part => part.value)
        .join('')
        .trim();
}

export function amountToCents(formattedAmount: string): number {
    const locale = getLocale();
    const currency = getCurrency(locale);
    const result: number = Number(formattedAmount)
    
    if (isNaN(result)) return 0;
    
    return currency === 'JPY' ? Math.round(result) : Math.round(result * 100);
}


export function millisToDateString(millis: number): string {
    const date = new Date(millis);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatDisplayDate(millis: number): string {
    const locale = getLocale();
    return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        timeZone: 'UTC'
    }).format(new Date(millis));
}

export function dateStringToMillis(dateString: string): number {
    const [year, month, day] = dateString.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
}

export function nowToString(): string {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
