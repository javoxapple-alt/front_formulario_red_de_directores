import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import ParticipantsList from './components/ParticipantsList';
import Login from './components/Login';
import './App.css';

// Ruta protegida — redirige al login si no hay sesión
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><span className="page-spinner" /></div>;
  return user ? <Navigate to="/participantes" replace /> : children;
}
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><span className="page-spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="header-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <circle cx="20" cy="20" r="20" fill="#1e4fc2" />
              <path d="M12 15h16M12 20h10M12 25h13" stroke="#f5bf40" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="28" cy="24" r="5" fill="#f5bf40" />
              <path d="M26 24l1.5 1.5L30 22" stroke="#1e4fc2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">I Encuentro de la Red</h1>
            <p className="brand-sub">Red de Colegios de Alto Hospicio · 2026</p>
          </div>
        </div>
        <div className="header-date">
          <span className="date-badge">📅 29 de Abril · 14:30 – 17:00 hrs</span>
        </div>
      </div>

      <nav className="app-nav">
        <div className="container nav-inner">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Registrarme
          </NavLink>

          {user ? (
            <>
              <NavLink to="/participantes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Ver participantes
              </NavLink>
              <div className="nav-user">
                <span className="nav-user-name">👤 {user.nombre}</span>
                <button className="nav-logout-btn" onClick={logout}>Cerrar sesión</button>
              </div>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🔐 Admin
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}

function RegisterPage({ onSuccess }) {
  return (
    <div className="page-layout">
      <div className="page-left">
        <div className="event-info">
          <h2 className="event-title">
            "Uniendo comunidades de Aprendizaje en Redes Colaborativas en Alto Hospicio"
          </h2>
          <div className="event-details">
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div><strong>Fecha</strong><span>29 de Abril, 2026</span></div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🕐</span>
              <div><strong>Horario</strong><span>14:30 – 17:00 hrs</span></div>
            </div>
          </div>
          <div className="areas-preview">
            <h3>Áreas disponibles</h3>
            <ul>
              {[
                ['Convivencia Educativa',      'C. Bicentenario William Taylor'],
                ['PIE',                         'C. Bicentenario Nirvana'],
                ['Docentes y Coordinadores TP', 'C. Domingo Savio'],
                ['Educ. Parvularia',            'C. Bicentenario Kronos'],
                ['Inglés',                      'C. Monte Carmelo'],
                ['PISE',                        'C. Metodista Robert Johnson'],
                ['UTP/Equipos Técnicos',        'C. Metodista Robert Johnson'],
                ['Coordinadores Extraescolar',  'C. Marista Hermano Fernando'],
              ].map(([area, sede]) => (
                <li key={area}>
                  <span className="area-dot" />
                  <div><strong>{area}</strong><small>{sede}</small></div>
                </li>
              ))}
            </ul>
          </div>
          <p className="event-quote">
            "Red de Directores y Directoras de Alto Hospicio: Construyendo puentes, transformando el futuro educativo."
          </p>
        </div>
      </div>
      <div className="page-right">
        <RegistrationForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}

function ParticipantsPage({ refreshKey }) {
  return (
    <div className="page-single">
      <div className="page-title-bar">
        <h2>Participantes registrados</h2>
        <p>Listado completo de inscritos al I Encuentro de la Red 2026</p>
      </div>
      <ParticipantsList refreshKey={refreshKey} />
    </div>
  );
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "'Sora', sans-serif", fontSize: '0.9rem' },
          success: { iconTheme: { primary: '#1e4fc2', secondary: 'white' } },
        }}
      />
      <Header />
      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="/" element={<RegisterPage onSuccess={() => setRefreshKey((k) => k + 1)} />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route
              path="/participantes"
              element={
                <PrivateRoute>
                  <ParticipantsPage refreshKey={refreshKey} />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>Red de Colegios de Alto Hospicio · Alto Hospicio, Chile</p>
        </div>
      </footer>
    </>
  );
}
