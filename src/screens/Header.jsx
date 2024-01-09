import React from 'react'
import './style.css'

function Header() {
    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }
    return (
        <div>
            <button class='logoutLblPos button-42 button-42:hover button-42:focus' onClick={logout}>
                Logout
            </button>
        </div>
    )
}

export default Header