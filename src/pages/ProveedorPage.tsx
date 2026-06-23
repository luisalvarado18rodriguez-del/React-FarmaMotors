import { useEffect, useState } from "react";
import { ProveedorService } from "../service/ProveedorService";
import type { Proveedor, ProveedorFormData } from "../type/Proveedor";

const EMPTY: ProveedorFormData = {
  ruc: "", nomRazSocial: "", telefono: "", direccion: "", correo: "",
};

export function ProveedorPage() {
  const [lista, setLista]     = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState<number | null>(null);
  const [form, setForm]       = useState<ProveedorFormData>(EMPTY);
  const [saving, setSaving]   = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      setLista(await ProveedorService.getAll());
      setError("");
    } catch {
      setError("Error al cargar proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = lista.filter(p =>
    p.nomRazSocial.toLowerCase().includes(search.toLowerCase()) ||
    p.ruc.includes(search) ||
    p.correo.toLowerCase().includes(search.toLowerCase())
  );

  const abrirCrear = () => { setForm(EMPTY); setEditId(null); setModal(true); };

  const abrirEditar = (p: Proveedor) => {
    setForm({ ruc: p.ruc, nomRazSocial: p.nomRazSocial, telefono: p.telefono, direccion: p.direccion, correo: p.correo });
    setEditId(p.cod_Proveedor);
    setModal(true);
  };

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    try {
      editId !== null ? await ProveedorService.update(editId, form) : await ProveedorService.create(form);
      setModal(false); cargar();
    } catch { setError("Error al guardar proveedor."); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este proveedor?")) return;
    try { await ProveedorService.delete(id); cargar(); }
    catch { setError("Error al eliminar proveedor."); }
  };

  return (
    <div>
      {/* Banner */}
      <div className="mod-banner">
        <div>
          <p className="mod-eyebrow">Módulo</p>
          <h2 className="mod-title">Proveedores</h2>
          <p className="mod-sub">Gestión de proveedores de repuestos</p>
        </div>
        <div className="mod-right">
          <div className="mod-stat">
            <span className="mod-stat-val">{lista.length}</span>
            <span className="mod-stat-lbl">Total</span>
          </div>
          <button className="btn btn-primary btn-lg" onClick={abrirCrear}>+ Nuevo proveedor</button>
        </div>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="toolbar">
          <div className="search-box">
            <input
              placeholder="Buscar por nombre, RUC o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="count-tag">
            Mostrando <strong>{filtrados.length}</strong> de {lista.length}
          </span>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="loading-ring" />
            <p className="loading-text">Cargando proveedores...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>RUC</th>
                  <th>Nombre / Razón Social</th>
                  <th>Teléfono</th>
                  <th>Correo electrónico</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.cod_Proveedor}>
                    <td className="td-num">{p.cod_Proveedor}</td>
                    <td className="td-mono">{p.ruc}</td>
                    <td className="td-bold">{p.nomRazSocial}</td>
                    <td className="td-muted">{p.telefono}</td>
                    <td className="td-muted">{p.correo}</td>
                    <td className="td-muted">{p.direccion}</td>
                    <td>
                      <div className="td-acts">
                        <button className="btn btn-edit btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                        <button className="btn btn-delete btn-sm" onClick={() => eliminar(p.cod_Proveedor)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr className="empty-row"><td colSpan={7}>Sin proveedores registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal modal-md">
            <div className="modal-head">
              <div>
                <p className="modal-head-sub">Proveedores</p>
                <h3 className="modal-head-title">{editId !== null ? "Editar proveedor" : "Nuevo proveedor"}</h3>
              </div>
              <button className="modal-x" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body">
                <div className="fgrid">
                  <div className="fg">
                    <label className="flabel">RUC</label>
                    <input className="finput" inputMode="numeric" value={form.ruc}
                      maxLength={11}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                        if (v.length >= 2 && !v.startsWith("10") && !v.startsWith("20")) return;
                        setForm({ ...form, ruc: v });
                      }} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Nombre / Razón Social</label>
                    <input className="finput" value={form.nomRazSocial}
                      onChange={e => setForm({ ...form, nomRazSocial: e.target.value })} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Teléfono</label>
                    <input className="finput" inputMode="numeric" value={form.telefono}
                      maxLength={9}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 9);
                        if (v !== "" && !v.startsWith("9")) return;
                        setForm({ ...form, telefono: v });
                      }} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Correo electrónico</label>
                    <input className="finput" type="email" value={form.correo}
                      onChange={e => setForm({ ...form, correo: e.target.value })} required />
                  </div>
                  <div className="fgfull">
                    <label className="flabel">Dirección</label>
                    <input className="finput" value={form.direccion}
                      onChange={e => setForm({ ...form, direccion: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost btn-md" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
