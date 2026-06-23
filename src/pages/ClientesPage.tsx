import { useEffect, useState } from "react";
import { ClienteService } from "../service/ClienteService";
import type { Cliente, ClienteFormData, TipoDocumento } from "../type/Cliente";

const EMPTY: ClienteFormData = {
  numDocumento: "", nomRazSocial: "", telefono: "", direccion: "", tipoDocumento: "DNI",
};

export default function ClientesPage() {
  const [lista, setLista]     = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState<number | null>(null);
  const [form, setForm]       = useState<ClienteFormData>(EMPTY);
  const [saving, setSaving]   = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      setLista(await ClienteService.getAll());
      setError("");
    } catch {
      setError("Error al cargar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = lista.filter(c =>
    c.nomRazSocial.toLowerCase().includes(search.toLowerCase()) ||
    c.numDocumento.includes(search)
  );

  const abrirCrear = () => { setForm(EMPTY); setEditId(null); setModal(true); };

  const abrirEditar = (c: Cliente) => {
    setForm({ numDocumento: c.numDocumento, nomRazSocial: c.nomRazSocial, telefono: c.telefono, direccion: c.direccion, tipoDocumento: c.tipoDocumento });
    setEditId(c.codCliente);
    setModal(true);
  };

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    try {
      editId !== null ? await ClienteService.update(editId, form) : await ClienteService.create(form);
      setModal(false); cargar();
    } catch { setError("Error al guardar cliente."); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try { await ClienteService.delete(id); cargar(); }
    catch { setError("Error al eliminar cliente."); }
  };

  return (
    <div>
      {/* Banner */}
      <div className="mod-banner">
        <div>
          <p className="mod-eyebrow">Módulo</p>
          <h2 className="mod-title">Clientes</h2>
          <p className="mod-sub">Gestión de clientes del taller</p>
        </div>
        <div className="mod-right">
          <div className="mod-stat">
            <span className="mod-stat-val">{lista.length}</span>
            <span className="mod-stat-lbl">Total</span>
          </div>
          <button className="btn btn-primary btn-lg" onClick={abrirCrear}>+ Nuevo cliente</button>
        </div>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <input
              placeholder="Buscar por nombre o documento..."
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
            <p className="loading-text">Cargando clientes...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo doc.</th>
                  <th>N° Documento</th>
                  <th>Nombre / Razón Social</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => (
                  <tr key={c.codCliente}>
                    <td className="td-num">{c.codCliente}</td>
                    <td>
                      <span className={`badge ${c.tipoDocumento === "DNI" ? "badge-dni" : "badge-ruc"}`}>
                        {c.tipoDocumento}
                      </span>
                    </td>
                    <td className="td-mono">{c.numDocumento}</td>
                    <td className="td-bold">{c.nomRazSocial}</td>
                    <td className="td-muted">{c.telefono}</td>
                    <td className="td-muted">{c.direccion}</td>
                    <td>
                      <div className="td-acts">
                        <button className="btn btn-edit btn-sm" onClick={() => abrirEditar(c)}>Editar</button>
                        <button className="btn btn-delete btn-sm" onClick={() => eliminar(c.codCliente)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr className="empty-row"><td colSpan={7}>Sin clientes registrados</td></tr>
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
                <p className="modal-head-sub">Clientes</p>
                <h3 className="modal-head-title">{editId !== null ? "Editar cliente" : "Nuevo cliente"}</h3>
              </div>
              <button className="modal-x" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body">
                <div className="fgrid">
                  <div className="fg">
                    <label className="flabel">Tipo de documento</label>
                    <select className="finput" value={form.tipoDocumento}
                      onChange={e => setForm({ ...form, tipoDocumento: e.target.value as TipoDocumento })}>
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label className="flabel">N° Documento</label>
                    <input className="finput" inputMode="numeric" value={form.numDocumento}
                      maxLength={form.tipoDocumento === "DNI" ? 8 : 11}
                      onChange={e => {
                        const max = form.tipoDocumento === "DNI" ? 8 : 11;
                        const v = e.target.value.replace(/\D/g, "").slice(0, max);
                        if (form.tipoDocumento === "RUC" && v.length >= 2 && !v.startsWith("10") && !v.startsWith("20")) return;
                        setForm({ ...form, numDocumento: v });
                      }} required />
                  </div>
                  <div className="fgfull">
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
