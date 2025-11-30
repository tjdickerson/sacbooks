import './App.css';
import logo from './assets/images/SacHead.svg'
import MenuItem from './MenuItem';

function Menu() {
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
                    <MenuItem displayText="Transactions" />
                    <MenuItem displayText="Recurring" />
                    <MenuItem displayText="Categories" />
                </div>
                
                <div className="menu-user">
                </div>
            </div>
        </div>
    )
}

export default Menu