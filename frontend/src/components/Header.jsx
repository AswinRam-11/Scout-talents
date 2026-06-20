import React from "react";

function Header(){
    return (
        <header style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 }}>
                SCOUT<span style={{ color: 'var(--accent-neon)' }}>AI</span>
            </h1>
        </header>
    )
}

export default Header;