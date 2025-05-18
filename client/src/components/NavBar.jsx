import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // crée ce fichier si besoin

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <ul className={`nav-links ${open ? 'open' : ''}`}>
        <li><Link to="/" onClick={() => setOpen(false)}>Monitoring</Link></li>
        <li><Link to="/stats" onClick={() => setOpen(false)}>Statistiques</Link></li>
        <li><Link to="/maintenance" onClick={() => setOpen(false)}>Maintenance</Link></li>
      </ul>
    </nav>
  );
}
