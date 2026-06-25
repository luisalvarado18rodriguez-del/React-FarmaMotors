import { useEffect, useState } from "react";
import { AuthService, type UsuarioForm, type UsuarioItem } from "../service/Authservice";

const EMPTY: UsuarioForm = { name: "", email: "", password: "", rol: "ADMIN" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios]   = useState<UsuarioItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState<UsuarioForm>({ ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess]     = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      setUsuarios(await AuthService.getUsuarios());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = () => {
    setForm({ ...EMPTY });
    setFormError("");
    setSuccess("");
    setModal(true);
  };

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim())     { setFormError("El nombre es obligatorio."); return; }
    if (!form.email.trim())    { setFormError("El correo es obligatorio."); return; }
    if (form.password.length < 6) { setFormError("La contraseña debe tener al menos 6 caracteres."); return; }

    setSaving(true);
    try {
      await AuthService.createUser(form);
      setModal(false);
      setSuccess("Usuario ADMIN creado correctamente.");
      cargar();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al crear usuario.");
    } finally {
      setSaving(false);
    }
  };

  const ROL_BADGE: Record<string, string> = {
    SUPERADMIN: "badge-factura",
    ADMIN:      "badge-process",
  };

  return (
    <div>
      <div className="mod-banner">
        <div>
          <p className="mod-eyebrow">Módulo</p>
          <h2 className="mod-title">Gestión de Usuarios</h2>
          <p className="mod-sub">Solo accesible para el Super Administrador</p>
        </div>
        <div className="mod-right">
          <button className="btn btn-primary btn-lg" onClick={abrirModal}>+ Nuevo usuario</button>
        </div>
      </div>

      <div className="page-content">
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-info">{success}</div>}

        {loading ? (
          <div className="loading-box">
            <div className="loading-ring" />
            <p className="loading-text">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td className="td-num">{u.id}</td>
                    <td className="td-bold">{u.name ?? "—"}</td>
                    <td className="td-muted" style={{ textTransform: "lowercase" }}>{u.email}</td>
                    <td>
                      <span className={`badge ${ROL_BADGE[u.rol] ?? "badge-pending"}`}>{u.rol}</span>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr className="empty-row"><td colSpan={4}>Sin usuarios registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal modal-md">
            <div className="modal-head">
              <div>
                <p className="modal-head-sub">Usuarios</p>
                <h3 className="modal-head-title">Nuevo usuario ADMIN</h3>
              </div>
              <button className="modal-x" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body">
                <div className="fgrid">
                  <div className="fgfull">
                    <label className="flabel">Nombre completo</label>
                    <input className="finput" placeholder="Ej. Juan García"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="fgfull">
                    <label className="flabel">Correo electrónico</label>
                    <input className="finput" type="email" placeholder="usuario@ejemplo.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="fgfull">
                    <label className="flabel">Contraseña</label>
                    <input className="finput" type="password" placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                  </div>
                  <div className="fgfull">
                    <label className="flabel">Rol</label>
                    <input className="finput" value="ADMIN" disabled
                      style={{ background: "#F1F5F9", color: "#64748B" }} />
                    <span style={{ fontSize: 11.5, color: "#64748B", marginTop: 4, display: "block" }}>
                      Solo se pueden crear usuarios con rol ADMIN.
                    </span>
                  </div>
                </div>
                {formError && <div className="alert alert-error" style={{ marginTop: 12, marginBottom: 0 }}>{formError}</div>}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost btn-md" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
                  {saving ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
