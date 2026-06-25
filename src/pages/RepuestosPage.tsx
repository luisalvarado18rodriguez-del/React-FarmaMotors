import { useEffect, useState } from "react";
import { RepuestoService } from "../service/RepuestoService";
import { ProveedorService } from "../service/ProveedorService";
import type { Repuesto, RepuestoFormData } from "../type/Repuesto";
import type { Proveedor } from "../type/Proveedor";

const EMPTY: RepuestoFormData = {
  cod_Proveedor: 0, nom_Repuesto: "", marcaRep: "", descripRep: "", precioUnitario: 0, stock: 0,
};

function stockClass(s: number) {
  return s > 10 ? "badge-stk-ok" : s > 0 ? "badge-stk-warn" : "badge-stk-out";
}

export default function RepuestosPage() {
  const [lista, setLista]         = useState<Repuesto[]>([]);
  const [proveedores, setProvs]   = useState<Proveedor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [form, setForm]           = useState<RepuestoFormData>(EMPTY);
  const [saving, setSaving]       = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [reps, provs] = await Promise.all([RepuestoService.getAll(), ProveedorService.getAll()]);
      setLista(reps); setProvs(provs); setError("");
    } catch {
      setError("Error al cargar repuestos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = lista.filter(r =>
    r.nom_Repuesto.toLowerCase().includes(search.toLowerCase()) ||
    r.marcaRep.toLowerCase().includes(search.toLowerCase())
  );

  const nomProv = (id: number) => proveedores.find(p => p.cod_Proveedor === id)?.nomRazSocial ?? `#${id}`;

  const abrirCrear = () => {
    setForm({ ...EMPTY, cod_Proveedor: proveedores[0]?.cod_Proveedor ?? 0 });
    setEditId(null); setModal(true);
  };

  const abrirEditar = (r: Repuesto) => {
    setForm({ cod_Proveedor: r.cod_Proveedor, nom_Repuesto: r.nom_Repuesto, marcaRep: r.marcaRep, descripRep: r.descripRep, precioUnitario: r.precioUnitario, stock: r.stock });
    setEditId(r.cod_Repuesto); setModal(true);
  };

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault(); setSaving(true);
    try {
      editId !== null ? await RepuestoService.update(editId, form) : await RepuestoService.create(form);
      setModal(false); cargar();
    } catch { setError("Error al guardar repuesto."); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este repuesto?")) return;
    try { await RepuestoService.delete(id); cargar(); }
    catch { setError("Error al eliminar repuesto."); }
  };

  return (
    <div>
      {/* Banner */}
      <div className="mod-banner">
        <div>
          <p className="mod-eyebrow">Módulo</p>
          <h2 className="mod-title">Repuestos</h2>
          <p className="mod-sub">Control de inventario y stock</p>
        </div>
        <div className="mod-right">
          <button className="btn btn-primary btn-lg" onClick={abrirCrear}>+ Nuevo repuesto</button>
        </div>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="toolbar">
          <div className="search-box">
            <input
              placeholder="Buscar por nombre o marca..."
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
            <p className="loading-text">Cargando repuestos...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Descripción</th>
                  <th>Proveedor</th>
                  <th>Precio unit.</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(r => (
                  <tr key={r.cod_Repuesto}>
                    <td className="td-num">{r.cod_Repuesto}</td>
                    <td className="td-bold">{r.nom_Repuesto}</td>
                    <td className="td-muted">{r.marcaRep}</td>
                    <td className="td-muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.descripRep}</td>
                    <td className="td-muted">{nomProv(r.cod_Proveedor)}</td>
                    <td className="td-bold">S/ {r.precioUnitario.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${stockClass(r.stock)}`}>{r.stock} uds.</span>
                    </td>
                    <td>
                      <div className="td-acts">
                        <button className="btn btn-edit btn-sm" onClick={() => abrirEditar(r)}>Editar</button>
                        <button className="btn btn-delete btn-sm" onClick={() => eliminar(r.cod_Repuesto)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr className="empty-row"><td colSpan={8}>Sin repuestos registrados</td></tr>
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
                <p className="modal-head-sub">Repuestos</p>
                <h3 className="modal-head-title">{editId !== null ? "Editar repuesto" : "Nuevo repuesto"}</h3>
              </div>
              <button className="modal-x" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body">
                <div className="fgrid">
                  <div className="fgfull">
                    <label className="flabel">Proveedor</label>
                    <select className="finput" value={form.cod_Proveedor}
                      onChange={e => setForm({ ...form, cod_Proveedor: Number(e.target.value) })} required>
                      <option value={0} disabled>Seleccionar proveedor</option>
                      {proveedores.map(p => (
                        <option key={p.cod_Proveedor} value={p.cod_Proveedor}>{p.nomRazSocial}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="flabel">Nombre</label>
                    <input className="finput" value={form.nom_Repuesto}
                      onChange={e => setForm({ ...form, nom_Repuesto: e.target.value })} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Marca</label>
                    <input className="finput" value={form.marcaRep}
                      onChange={e => setForm({ ...form, marcaRep: e.target.value })} required />
                  </div>
                  <div className="fgfull">
                    <label className="flabel">Descripción</label>
                    <input className="finput" value={form.descripRep}
                      onChange={e => setForm({ ...form, descripRep: e.target.value })} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Precio unitario (S/)</label>
                    <input className="finput" inputMode="decimal" value={form.precioUnitario}
                      onChange={e => {
                        const v = e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
                        setForm({ ...form, precioUnitario: v === "" || v === "." ? 0 : parseFloat(v) || 0 });
                      }} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Stock</label>
                    <input className="finput" inputMode="numeric" value={form.stock}
                      onChange={e => setForm({ ...form, stock: Number(e.target.value.replace(/\D/g, "")) || 0 })} required />
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
