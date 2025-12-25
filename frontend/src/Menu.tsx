import './App.css';
import logo from './assets/images/SacHead.svg'
import MenuItem from './MenuItem';
import { ViewId } from './views';

 
type MenuProps = {
    currentView: ViewId;
    onNavigate: (view: ViewId) => void;
};

function Menu({currentView, onNavigate}: MenuProps) {
    const items: {id: ViewId, displayText: string}[] = [
        { id: 'transactions', displayText: 'Transactions' },
        { id: 'recurrings', displayText: 'Recurring Transactions' },
        { id: 'categories', displayText: 'Categories' },
        { id: 'accounts', displayText: 'Accounts' },
    ];
    
    return (
        <div id="Menu" className="menu-bar">
            <div className="menu-layout">
                <div className="menu-title">
                    <div className="menu-logo">
                        <img src={logo} alt="Logo" className="menu-logo-image"/>
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
                </div>
            </div>
        </div>
    )
}

export default Menu
