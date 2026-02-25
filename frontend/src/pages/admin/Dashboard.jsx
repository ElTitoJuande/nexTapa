

export const Dashboard = () => {
   return (
      <div>
         <h2 className="text-2xl font-bold">Dashboard</h2>
         <p>Bienvenido al panel de administración</p>
      </div>
   );
};


// import { useState, useEffect } from 'react';
// import './styles/dashboard.css';


// // ─── Datos ficticios ────────────────────────────────────────────────────────

// const STATS = [
//    { label: 'Establecimientos', value: 47, delta: '+4 este mes', icon: '🏪', color: 'var(--amber)', trend: 'up' },
//    { label: 'Tapas publicadas', value: 312, delta: '+27 este mes', icon: '🍽️', color: 'var(--coral)', trend: 'up' },
//    { label: 'Usuarios registrados', value: 1_284, delta: '+91 este mes', icon: '👥', color: 'var(--sage)', trend: 'up' },
//    { label: 'Valoraciones', value: 5_730, delta: '+342 esta semana', icon: '⭐', color: 'var(--sky)', trend: 'up' },
// ];

// const PENDING = [
//    {
//       id: 'P001',
//       type: 'establishment',
//       label: 'Nuevo establecimiento',
//       name: 'Taberna El Rincón',
//       subtitle: 'Solicitado por pedro.garcia@mail.com',
//       time: 'Hace 20 min',
//       urgent: true,
//    },
//    {
//       id: 'P002',
//       type: 'tapa',
//       label: 'Tapa sin foto',
//       name: 'Croquetas de ibérico',
//       subtitle: 'Bar La Esquina · Sin imagen desde hace 3 días',
//       time: 'Hace 1 h',
//       urgent: false,
//    },
//    {
//       id: 'P003',
//       type: 'establishment',
//       label: 'Datos incompletos',
//       name: 'Mesón La Fuente',
//       subtitle: 'Falta horario y coordenadas GPS',
//       time: 'Hace 2 h',
//       urgent: false,
//    },
//    {
//       id: 'P004',
//       type: 'report',
//       label: 'Reporte de usuario',
//       name: 'Contenido inapropiado',
//       subtitle: 'Reseña reportada en Bar Manolo',
//       time: 'Hace 3 h',
//       urgent: true,
//    },
//    {
//       id: 'P005',
//       type: 'establishment',
//       label: 'Nuevo establecimiento',
//       name: 'La Cervecería del Norte',
//       subtitle: 'Solicitado por maria.lopez@mail.com',
//       time: 'Hace 5 h',
//       urgent: false,
//    },
// ];

// const ACTIVITY = [
//    { icon: '🏪', text: 'Bar Los Caracoles publicado', time: 'Hace 10 min', type: 'success' },
//    { icon: '👤', text: 'Nuevo usuario: ana.martin@mail.com', time: 'Hace 32 min', type: 'info' },
//    { icon: '🍽️', text: 'Tapa "Patatas bravas" aprobada', time: 'Hace 1 h', type: 'success' },
//    { icon: '❌', text: 'Establecimiento rechazado: Café X', time: 'Hace 2 h', type: 'error' },
//    { icon: '📷', text: '8 fotos subidas en Taberna Sol', time: 'Hace 3 h', type: 'info' },
//    { icon: '⭐', text: 'Valoración 5★ en El Rincón Vasco', time: 'Hace 4 h', type: 'success' },
//    { icon: '🗺️', text: 'Coordenadas actualizadas: 3 bares', time: 'Hace 5 h', type: 'info' },
// ];

// const TOP_ESTABLISHMENTS = [
//    { name: 'El Rincón Vasco', tapas: 18, rating: 4.9, visits: 1_203 },
//    { name: 'Taberna La Abuela', tapas: 24, rating: 4.8, visits: 987 },
//    { name: 'Bar Los Caracoles', tapas: 11, rating: 4.7, visits: 854 },
//    { name: 'La Cervecería del Norte', tapas: 15, rating: 4.6, visits: 720 },
//    { name: 'Mesón El Pilar', tapas: 9, rating: 4.5, visits: 612 },
// ];

// const MAP_STATS = [
//    { zone: 'Centro', count: 18, pct: 38 },
//    { zone: 'Lavapiés', count: 11, pct: 23 },
//    { zone: 'Malasaña', count: 9, pct: 19 },
//    { zone: 'Chueca', count: 6, pct: 13 },
//    { zone: 'Otros', count: 3, pct: 7 },
// ];

// // ─── Componentes pequeños ────────────────────────────────────────────────────

// const StatCard = ({ stat, index }) => {
//    const [count, setCount] = useState(0);

//    useEffect(() => {
//       const target = stat.value;
//       const duration = 1000;
//       const step = Math.ceil(target / (duration / 16));
//       let current = 0;
//       const delay = index * 120;

//       const timer = setTimeout(() => {
//          const interval = setInterval(() => {
//             current = Math.min(current + step, target);
//             setCount(current);
//             if (current >= target) {clearInterval(interval);}
//          }, 16);
//          return () => clearInterval(interval);
//       }, delay);

//       return () => clearTimeout(timer);
//    }, [stat.value, index]);

//    return (
//       <div className="stat-card" style={{ '--accent': stat.color }}>
//          <div className="stat-icon">{stat.icon}</div>
//          <div className="stat-body">
//             <p className="stat-label">{stat.label}</p>
//             <p className="stat-value">{count.toLocaleString('es-ES')}</p>
//             <p className="stat-delta">
//                <span className={`trend ${stat.trend}`}>↑</span> {stat.delta}
//             </p>
//          </div>
//          <div className="stat-bar" />
//       </div>
//    );
// };

// const PendingBadge = ({ type }) => {
//    const map = {
//       establishment: { label: 'Local', color: '#f59e0b' },
//       tapa: { label: 'Tapa', color: '#10b981' },
//       report: { label: 'Reporte', color: '#ef4444' },
//    };
//    const { label, color } = map[type] || { label: type, color: '#888' };
//    return (
//       <span className="badge" style={{ background: color + '22', color, border: `1px solid ${color}55` }}>
//          {label}
//       </span>
//    );
// };

// // ─── Dashboard principal ─────────────────────────────────────────────────────

// export const Dashboard = () => {
//    const [activeTab, setActiveTab] = useState('activity');

//    const urgentCount = PENDING.filter((p) => p.urgent).length;

//    return (
//       <>
         

//          <div className="dash">
//             {/* Header */}
//             <div className="dash-header">
//                <div>
//                   <h1 className="dash-title">nex<span>Tapa</span> <span style={{ color: 'var(--muted)', fontWeight: 400 }}>admin</span></h1>
//                   <p className="dash-subtitle">Vista general de la plataforma · datos de muestra</p>
//                </div>
//                <span className="dash-date">
//                   {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
//                </span>
//             </div>

//             {/* Stat cards */}
//             <div className="stats-grid">
//                {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
//             </div>

//             {/* Main 2-col */}
//             <div className="main-grid">
//                {/* Left: Tabs panel (Actividad / Top establecimientos) */}
//                <div className="panel">
//                   <div className="tabs">
//                      {[
//                         { id: 'activity', label: '📋 Actividad reciente' },
//                         { id: 'top', label: '🏆 Top establecimientos' },
//                      ].map((t) => (
//                         <button
//                            key={t.id}
//                            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
//                            onClick={() => setActiveTab(t.id)}
//                         >
//                            {t.label}
//                         </button>
//                      ))}
//                   </div>

//                   {activeTab === 'activity' && (
//                      <ul className="activity-list">
//                         {ACTIVITY.map((a, i) => (
//                            <li className="activity-item" key={i}>
//                               <span className="activity-icon">{a.icon}</span>
//                               <span className="activity-text">{a.text}</span>
//                               <span className={`activity-dot ${a.type}`} />
//                               <span className="activity-time">{a.time}</span>
//                            </li>
//                         ))}
//                      </ul>
//                   )}

//                   {activeTab === 'top' && (
//                      <table className="top-table">
//                         <thead>
//                            <tr>
//                               <th>#</th>
//                               <th>Establecimiento</th>
//                               <th>Tapas</th>
//                               <th>Rating</th>
//                               <th>Visitas</th>
//                            </tr>
//                         </thead>
//                         <tbody>
//                            {TOP_ESTABLISHMENTS.map((e, i) => (
//                               <tr key={e.name}>
//                                  <td><span className="top-rank">#{i + 1}</span></td>
//                                  <td><span className="top-name">{e.name}</span></td>
//                                  <td>{e.tapas}</td>
//                                  <td>
//                                     <span className="rating-pill">⭐ {e.rating}</span>
//                                  </td>
//                                  <td>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                                        {e.visits.toLocaleString('es-ES')}
//                                        <div className="progress-bar">
//                                           <div
//                                              className="progress-fill"
//                                              style={{ width: `${(e.visits / 1203) * 100}%` }}
//                                           />
//                                        </div>
//                                     </div>
//                                  </td>
//                               </tr>
//                            ))}
//                         </tbody>
//                      </table>
//                   )}
//                </div>

//                {/* Right: Pendientes */}
//                <div className="panel">
//                   <div className="panel-header">
//                      <span className="panel-title">
//                 ⚠️ Pendientes
//                         {urgentCount > 0 && (
//                            <span className="panel-badge">{urgentCount} urgentes</span>
//                         )}
//                      </span>
//                      <button className="panel-link">Ver todos</button>
//                   </div>
//                   <ul className="pending-list">
//                      {PENDING.map((item) => (
//                         <li className="pending-item" key={item.id}>
//                            <span className={`pending-dot ${item.urgent ? 'urgent' : 'normal'}`} />
//                            <div className="pending-info">
//                               <p className="pending-name">{item.name}</p>
//                               <p className="pending-sub">{item.subtitle}</p>
//                            </div>
//                            <div className="pending-right">
//                               <span className="pending-time">{item.time}</span>
//                               <PendingBadge type={item.type} />
//                               <div style={{ display: 'flex', gap: 4 }}>
//                                  <button className="btn-approve">✓</button>
//                                  <button className="btn-reject">✕</button>
//                               </div>
//                            </div>
//                         </li>
//                      ))}
//                   </ul>
//                </div>
//             </div>

//             {/* Bottom grid */}
//             <div className="bottom-grid">
//                {/* Distribución por zona */}
//                <div className="panel">
//                   <div className="panel-header">
//                      <span className="panel-title">🗺️ Distribución por zona</span>
//                   </div>
//                   <div className="zones-panel">
//                      {MAP_STATS.map((z) => (
//                         <div className="zone-row" key={z.zone}>
//                            <span className="zone-name">{z.zone}</span>
//                            <div className="zone-bar-wrap">
//                               <div className="zone-bar-fill" style={{ width: `${z.pct}%` }} />
//                            </div>
//                            <span className="zone-pct">{z.pct}%</span>
//                            <span className="zone-count">{z.count}</span>
//                         </div>
//                      ))}
//                   </div>
//                </div>

//                {/* Acciones rápidas */}
//                <div className="panel">
//                   <div className="panel-header">
//                      <span className="panel-title">⚡ Acciones rápidas</span>
//                   </div>
//                   <div className="quick-actions">
//                      {[
//                         { icon: '🏪', label: 'Nuevo establecimiento' },
//                         { icon: '🍽️', label: 'Nueva tapa' },
//                         { icon: '👤', label: 'Nuevo usuario' },
//                         { icon: '📷', label: 'Subir fotos' },
//                         { icon: '🗺️', label: 'Ver mapa' },
//                         { icon: '📊', label: 'Exportar datos' },
//                      ].map((a) => (
//                         <button className="qa-btn" key={a.label}>
//                            <span className="qa-icon">{a.icon}</span>
//                            {a.label}
//                         </button>
//                      ))}
//                   </div>
//                </div>
//             </div>
//          </div>
//       </>
//    );
// };

