import React from 'react'
import './styles.css';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { GrLogout } from "react-icons/gr";

function NavBar() {
  return (
    <div className='navbar'>
          <h1 style={{color:"var(--white)"}} className='title'>Sarkul Technology Private Limited</h1>
       
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => {
            const current = localStorage.getItem('ui-version') || 'classic';
            localStorage.setItem('ui-version', current === 'classic' ? 'modern' : 'classic');
            window.location.reload(); // Force reload to trigger index.js re-render easily for now
          }}
          style={{
            padding: '5px 15px',
            borderRadius: '20px',
            border: '1px solid var(--white)',
            background: 'transparent',
            color: 'var(--white)',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Try Modern UI ✨
        </button>
        <Link to="/logout" className='logout'>
          <GrLogout/>
        </Link>
      </div>
    </div>
  )
}

export default NavBar