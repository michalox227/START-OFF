import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="app__header">
      <div className="brand">
        <div className="brand__mark" />
        <div>
          <div className="brand__title">Grantland</div>
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
      </nav>
    </header>
  );
}
