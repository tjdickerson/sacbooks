import './App.css';

function MenuItem({ id, displayText, active, onClick }) {

    return (
        <div 
            className={`menu-item ${active ? 'menu-item-active' : ''}`}
            onClick={() => onClick(id)}
            role="button"
            tabIndex={0}
        >
            {displayText}
        </div>
    )
}

export default MenuItem