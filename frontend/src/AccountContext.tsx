import {createContext, useContext} from 'react';
import { types as t } from "../wailsjs/go/models";

export type AccountContextValue = {
    selectedAccount: t.Account | null;
    setSelectedAccount: (account: t.Account | null) => void;
};

export const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccountSelection(): AccountContextValue {
    const ctx = useContext(AccountContext);
    if (!ctx) {
        throw new Error ('useAccountSelection must be used within AccountContext.Provider');
    }

    return ctx;
}
