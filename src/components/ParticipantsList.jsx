import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getRegistrations, getStats, deleteRegistration } from '../api';
import { exportarParticipantes } from '../utils/exportExcel';
import './ParticipantsList.css';

const AREA_COLORS = [
  '#1e4fc2','#7c3aed','#db2777','#d97706',
  '#059669','#0284c7','#dc2626','#047857',
];

export default function ParticipantsList({ refreshKey }) {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats]       = useState({ total: 0, data: [] });
  const [filterArea, setFilterArea] = useState('');
  const [areas, setAreas]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deleting, setDeleting] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [regRes, statsRes] = await Promise.all([
        getRegistrations(filterArea),
        getStats(),
      ]);
      setRegistrations(regRes.data.data);
      setStats(statsRes.data);
      const uniqueAreas = [...new Set(regRes.data.data.map((r) => r.area))];
      setAreas(uniqueAreas);
    } catch {
      toast.error('Error cargando participantes');
    } finally {
      setLoading(false);
    }
  }, [filterArea, refreshKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar el registro de ${nombre}?`)) return;
    setDeleting(id);
    try {
      await deleteRegistration(id);
      toast.success('Registro eliminado');
      fetchData();
    } catch {
      toast.error('No se pudo eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async () => {
    if (registrations.length === 0) {
      toast.error('No hay participantes para exportar');
      return;
    }
    setExporting(true);
    try {
      await exportarParticipantes(registrations);
      toast.success(`Excel generado con ${registrations.length} participantes ✓`);
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el Excel');
    } finally {
      setExporting(false);
    }
  };

  const filtered = registrations.filter((r) =>
    r.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
    r.colegioOrigen?.toLowerCase().includes(search.toLowerCase()) ||
    r.rut?.toLowerCase().includes(search.toLowerCase())
  );

  const getAreaColor = (area) => {
    const ALL_AREAS = [
      'Convivencia Educativa','PIE','Docentes y Coordinadores TP',
      'Educ. Parvularia','Inglés','PISE','UTP/Equipos Técnicos','Coordinadores Extraescolar',
    ];
    const idx = ALL_AREAS.indexOf(area);
    return AREA_COLORS[idx >= 0 ? idx : 0];
  };

  return (
    <div className="list-wrapper">

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total registrados</span>
        </div>
        {stats.data.map((s) => (
          <div key={s._id} className="stat-card area-stat"
            style={{ '--area-color': getAreaColor(s._id) }}>
            <span className="stat-number">{s.count}</span>
            <span className="stat-label">{s._id}</span>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="list-controls">
        <input
          type="search"
          placeholder="Buscar por nombre, RUT o colegio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Botón exportar Excel */}
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={exporting || registrations.length === 0}
          title="Exportar a Excel ordenado por establecimiento"
        >
          {exporting ? (
            <><span className="export-spinner" /> Generando...</>
          ) : (
            <>📊 Exportar Excel</>
          )}
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="loading-state">
          <div className="loader" />
          <span>Cargando participantes...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>{registrations.length === 0
            ? 'Aún no hay participantes registrados'
            : 'No se encontraron resultados'}
          </p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="participants-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Cargo</th>
                <th>Establecimiento</th>
                <th>Área</th>
                <th>Sede</th>
                <th>Contacto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r._id}>
                  <td className="td-num">{i + 1}</td>
                  <td className="td-name">{r.nombreCompleto}</td>
                  <td className="td-mono">{r.rut}</td>
                  <td><span className="cargo-tag">{r.cargo}</span></td>
                  <td>
                    <div className="td-colegio">
                      <span>{r.colegioOrigen}</span>
                      {r.comunaOrigen && (
                        <span className={`comuna-mini ${r.comunaOrigen === 'Alto Hospicio' ? 'tag-ah' : r.comunaOrigen === 'Iquique' ? 'tag-iq' : 'tag-otro'}`}>
                          {r.comunaOrigen}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="area-tag"
                      style={{ background: getAreaColor(r.area) + '20', color: getAreaColor(r.area), border: `1.5px solid ${getAreaColor(r.area)}40` }}>
                      {r.area}
                    </span>
                  </td>
                  <td className="td-sede">{r.sede}</td>
                  <td className="td-contact">
                    <a href={`mailto:${r.email}`} title={r.email}>✉</a>
                    <a href={`tel:${r.telefono}`} title={r.telefono}>📞</a>
                  </td>
                  <td>
                    <button className="delete-btn"
                      onClick={() => handleDelete(r._id, r.nombreCompleto)}
                      disabled={deleting === r._id}
                      title="Eliminar registro">
                      {deleting === r._id ? '...' : '✕'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="list-footer">
        Mostrando {filtered.length} de {registrations.length} participantes
        {filtered.length > 0 && (
          <button className="export-btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generando...' : '📊 Exportar Excel'}
          </button>
        )}
      </div>
    </div>
  );
}
