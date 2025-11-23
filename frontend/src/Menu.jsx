import './App.css';
import logo from './assets/images/SacHead.svg'
import MenuItem from './MenuItem';

function Menu() {
    return (
        <div id="Menu" class="menu-bar">
            <div class="menu-layout">
                <div class="menu-title">
                    <div class="menu-logo">
                        <img src={logo} alt="Logo" class="menu-logo-image"/>
                    </div>
                    <div class="menu-title-text">
                        sacbooks
                    </div>
                </div>


                <div class="menu-items">
                    <MenuItem displayText="Transactions" />
                    <MenuItem displayText="Recurring" />
                    <MenuItem displayText="Categories" />
                </div>
                
                <div class="menu-user">
                </div>
            </div>
        </div>
    )
}

export default Menu