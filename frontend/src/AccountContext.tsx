import {createContext, useContext} from 'react';


export type AccountContextValue = {
    selectedAccountId: number | null;
    setSelectedAccountId: (id: number | null) => void;
};

export const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccountSelection(): AccountContextValue {
    const ctx = useContext(AccountContext);
    if (!ctx) {
        throw new Error ('useAccountSelection must be used within AccountContext.Provider');
    }

    return ctx;
}
