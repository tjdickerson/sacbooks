import { useAccountSelection } from './AccountContext';
import './App.css';
import MenuItem from './MenuItem';
import { ViewId } from './views';

// @ts-ignore
import logo from './assets/images/SacHead.svg'

type MenuProps = {
    currentView: ViewId;
    onNavigate: (view: ViewId) => void;
};

function Menu({ currentView, onNavigate }: MenuProps) {
    const items: { id: ViewId, displayText: string }[] = [
        { id: 'transactions', displayText: 'Transactions' },
        { id: 'recurrings', displayText: 'Recurring Transactions' },
        { id: 'accounts', displayText: 'Accounts' },
        { id: 'categories', displayText: 'Categories' },
    ];

    const { selectedAccount } = useAccountSelection();

    return (
        <div id="Menu" className="menu-bar">
            <div className="menu-layout">
                <div className="menu-title">
                    <div className="menu-logo">
                        <img src={logo} alt="Logo" className="menu-logo-image" />
                    </div>
                    <div className="menu-title-text">
                        sacbooks
                    </div>
                </div>


                <div className="menu-items">
                    {items.map(it => (
                        <MenuItem
                            key={it.id}
                            id={it.id}
                            displayText={it.displayText}
                            active={it.id === currentView}
                            onClick={onNavigate}
                        />
                    ))}
                </div>

                <div className="menu-user">
                    <div className='active-account'>{selectedAccount?.name}</div>
                    <div className='active-period'>{selectedAccount?.period?.reporting_start} - {selectedAccount?.period?.reporting_end}</div>
                </div>
            </div>
        </div>
    )
}

export default Menu
