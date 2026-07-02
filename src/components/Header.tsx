import { NavLink } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="app__header">
      <div className="brand">
        <div className="brand__mark" />
        <div>
          <div className="brand__title">GO ON [OFF] SHORE</div>
          <div className="brand__subtitle">Architektura organizacji · AI-first CRM</div>
        </div>
      </div>
      <nav className="nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
        >
          Mapa
        </NavLink>
        <NavLink
          to="/struktura"
          className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
        >
          Struktura
        </NavLink>
        <NavLink
          to="/baza-wiedzy"
          className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
        >
          Baza wiedzy
        </NavLink>
        <button className="nav__link nav__logout" onClick={logout} title="Wyloguj się z platformy">
          Wyloguj
        </button>
      </nav>
    </header>
  );
}
