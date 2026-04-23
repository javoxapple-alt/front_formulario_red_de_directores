import { useState } from 'react';
import toast from 'react-hot-toast';
import { createRegistration } from '../api';
import AREAS from '../data/areas';
import COLEGIOS from '../data/colegios';
import './RegistrationForm.css';

const CARGOS = ['Director/a','Jefe/a UTP','Coordinador/a','Docente','Asistente de la Educación','Otro'];

const COLEGIOS_AH   = COLEGIOS.filter((c) => c.comuna === 'Alto Hospicio');
const COLEGIOS_IQ   = COLEGIOS.filter((c) => c.comuna === 'Iquique');
const COLEGIOS_OTRO = COLEGIOS.filter((c) => c.comuna === 'Otro');

function formatRut(value) {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const dv = clean.slice(-1);
  let body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${dv}`;
}

export default function RegistrationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [sede, setSede] = useState('');
  const [form, setForm] = useState({
    nombreCompleto: '',
    rut: '',
    email: '',
    telefono: '',
    colegioOrigen: '',
    comunaOrigen: '',
    cargo: '',
    area: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'rut') {
      setForm((prev) => ({ ...prev, rut: formatRut(value) }));
      return;
    }

    if (name === 'area') {
      const found = AREAS.find((a) => a.nombre === value);
      setSede(found ? found.sede : '');
    }

    if (name === 'colegioOrigen') {
      const found = COLEGIOS.find((c) => c.nombre === value);
      setForm((prev) => ({
        ...prev,
        colegioOrigen: value,
        comunaOrigen: found ? found.comuna : '',
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.colegioOrigen) { toast.error('Selecciona tu establecimiento de origen'); return; }
    if (!form.area)          { toast.error('Selecciona un área de participación');     return; }

    setLoading(true);
    try {
      await createRegistration(form);
      toast.success('¡Registro exitoso! Te esperamos el 29 de abril 🎉');
      setForm({ nombreCompleto:'', rut:'', email:'', telefono:'', colegioOrigen:'', comunaOrigen:'', cargo:'', area:'' });
      setSede('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const comunaClass = form.comunaOrigen === 'Alto Hospicio' ? 'tag-ah'
    : form.comunaOrigen === 'Iquique' ? 'tag-iq' : 'tag-otro';

  return (
    <div className="form-wrapper">
      <div className="form-header">
        <span className="form-badge">Inscripción</span>
        <h2>Completa tu registro</h2>
        <p>Todos los campos son obligatorios</p>
      </div>

      <form onSubmit={handleSubmit} className="reg-form">
        <div className="form-grid">

          {/* Nombre */}
          <div className="field full">
            <label htmlFor="nombreCompleto">Nombre completo</label>
            <input id="nombreCompleto" name="nombreCompleto" type="text"
              placeholder="Ej: María González Pérez"
              value={form.nombreCompleto} onChange={handleChange} required />
          </div>

          {/* RUT */}
          <div className="field">
            <label htmlFor="rut">RUT</label>
            <input id="rut" name="rut" type="text" placeholder="12.345.678-9"
              value={form.rut} onChange={handleChange} maxLength={12} required />
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" placeholder="correo@colegio.cl"
              value={form.email} onChange={handleChange} required />
          </div>

          {/* Teléfono */}
          <div className="field">
            <label htmlFor="telefono">Teléfono / Celular</label>
            <input id="telefono" name="telefono" type="tel" placeholder="+56 9 1234 5678"
              value={form.telefono} onChange={handleChange} required />
          </div>

          {/* Cargo */}
          <div className="field">
            <label htmlFor="cargo">Cargo</label>
            <select id="cargo" name="cargo" value={form.cargo} onChange={handleChange} required>
              <option value="">— Selecciona tu cargo —</option>
              {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Establecimiento */}
          <div className="field full">
            <label htmlFor="colegioOrigen">
              Establecimiento de origen
              <span className="field-count"> ({COLEGIOS.length - 1} establecimientos)</span>
            </label>
            <select id="colegioOrigen" name="colegioOrigen"
              value={form.colegioOrigen} onChange={handleChange} required>
              <option value="">— Selecciona tu establecimiento —</option>
              <optgroup label="── Alto Hospicio ──────────────────">
                {COLEGIOS_AH.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
              </optgroup>
              <optgroup label="── Iquique ────────────────────────">
                {COLEGIOS_IQ.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
              </optgroup>
              {COLEGIOS_OTRO.length > 0 && (
                <optgroup label="── Otro ───────────────────────────">
                  {COLEGIOS_OTRO.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                </optgroup>
              )}
            </select>

            {form.colegioOrigen && (
              <div className="colegio-confirm">
                <span>🏫</span>
                <span className="colegio-confirm-nombre">{form.colegioOrigen}</span>
                <span className={`comuna-tag ${comunaClass}`}>{form.comunaOrigen}</span>
              </div>
            )}
          </div>

          {/* Área — datos estáticos, sin llamada API */}
          <div className="field full">
            <label htmlFor="area">Área de participación</label>
            <select id="area" name="area" value={form.area} onChange={handleChange} required>
              <option value="">— Selecciona tu área —</option>
              {AREAS.map((a) => (
                <option key={a.nombre} value={a.nombre}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {/* Sede asignada automáticamente */}
          {sede && (
            <div className="field full">
              <div className="sede-badge">
                <span className="sede-icon">📍</span>
                <div>
                  <span className="sede-label">Tu sede asignada:</span>
                  <span className="sede-name">{sede}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? <span className="spinner" />
            : <><span>Registrarme</span><span className="btn-arrow">→</span></>}
        </button>
      </form>
    </div>
  );
}
