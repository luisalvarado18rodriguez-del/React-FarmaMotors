import { useEffect, useState } from "react";
import { MantenimientoService } from "../service/MantenimientoService";
import { ClienteService } from "../service/ClienteService";
import type { Mantenimiento, MantenimientoFormData, EstadoMant } from "../type/Mantenimiento";
import type { Cliente } from "../type/Cliente";

const ESTADOS_FORM: EstadoMant[] = ["Pendiente", "En Proceso", "Finalizado"];

const ESTADO_BADGE: Record<EstadoMant, string> = {
  Pendiente:    "badge-pending",
  "En Proceso": "badge-process",
  Completado:   "badge-done",
  Finalizado:   "badge-final",
  Entregado:    "badge-delivered",
};

const EMPTY: MantenimientoFormData = {
  cod_Cliente: 0, motoPlaca: "", motoModelo: "",
  descripcionAveria: "", costoManoObra: 0, estado: "Pendiente",
};

export default function MantenimientosPage() {
  const [lista, setLista]       = useState<Mantenimiento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState<MantenimientoFormData>(EMPTY);
  const [saving, setSaving]     = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [mants, clts] = await Promise.all([MantenimientoService.getAll(), ClienteService.getAll()]);
      setLista(mants); setClientes(clts); setError("");
    } catch {
      setError("Error al cargar mantenimientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = lista.filter(m =>
    m.motoPlaca.toLowerCase().includes(search.toLowerCase()) ||
    m.motoModelo.toLowerCase().includes(search.toLowerCase()) ||
    nomCliente(m.cod_Cliente).toLowerCase().includes(search.toLowerCase())
  );

  const pendientes  = lista.filter(m => m.estado === "Pendiente").length;
  const enProceso   = lista.filter(m => m.estado === "En Proceso").length;

  function nomCliente(id: number) {
    return clientes.find(c => c.codCliente === id)?.nomRazSocial ?? `#${id}`;
  }

  const abrirCrear = () => {
    setForm({ ...EMPTY, cod_Cliente: clientes[0]?.codCliente ?? 0 });
    setEditId(null); setModal(true);
  };

  const abrirEditar = (m: Mantenimiento) => {
    setForm({ cod_Cliente: m.cod_Cliente, motoPlaca: m.motoPlaca, motoModelo: m.motoModelo, descripcionAveria: m.descripcionAveria, costoManoObra: m.costoManoObra, estado: m.estado });
    setEditId(m.cod_Mantenimiento); setModal(true);
  };

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault(); setSaving(true);
    try {
      editId !== null ? await MantenimientoService.update(editId, form) : await MantenimientoService.create(form);
      setModal(false); cargar();
    } catch { setError("Error al guardar mantenimiento."); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este mantenimiento?")) return;
    try { await MantenimientoService.delete(id); cargar(); }
    catch { setError("Error al eliminar mantenimiento."); }
  };

  return (
    <div>
      {/* Banner */}
      <div className="mod-banner">
        <div>
          <p className="mod-eyebrow">Módulo</p>
          <h2 className="mod-title">Mantenimientos</h2>
          <p className="mod-sub">Órdenes de servicio y reparaciones</p>
        </div>
        <div className="mod-right">
          {pendientes > 0 && (
            <div className="mod-stat">
              <span className="mod-stat-val" style={{ color: "#FCD34D" }}>{pendientes}</span>
              <span className="mod-stat-lbl">Pendientes</span>
            </div>
          )}
          {enProceso > 0 && (
            <div className="mod-stat">
              <span className="mod-stat-val" style={{ color: "#93C5FD" }}>{enProceso}</span>
              <span className="mod-stat-lbl">En proceso</span>
            </div>
          )}
          <div className="mod-stat">
            <span className="mod-stat-val">{lista.length}</span>
            <span className="mod-stat-lbl">Total</span>
          </div>
          <button className="btn btn-primary btn-lg" onClick={abrirCrear}>+ Nuevo</button>
        </div>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="toolbar">
          <div className="search-box">
            <input
              placeholder="Buscar por placa, modelo o cliente..."
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
            <p className="loading-text">Cargando mantenimientos...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Avería</th>
                  <th>Costo M.O.</th>
                  <th>Estado</th>
                  <th>Fecha ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(m => (
                  <tr key={m.cod_Mantenimiento}>
                    <td className="td-num">{m.cod_Mantenimiento}</td>
                    <td className="td-bold">{nomCliente(m.cod_Cliente)}</td>
                    <td className="td-mono">{m.motoPlaca}</td>
                    <td className="td-muted">{m.motoModelo}</td>
                    <td className="td-muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.descripcionAveria}</td>
                    <td className="td-bold">S/ {m.costoManoObra.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${ESTADO_BADGE[m.estado] ?? "badge-pending"}`}>{m.estado}</span>
                    </td>
                    <td className="td-muted">{m.fechaIngreso}</td>
                    <td>
                      <div className="td-acts">
                        <button className="btn btn-edit btn-sm" onClick={() => abrirEditar(m)}>Editar</button>
                        <button className="btn btn-delete btn-sm" onClick={() => eliminar(m.cod_Mantenimiento)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr className="empty-row"><td colSpan={9}>Sin mantenimientos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-head">
              <div>
                <p className="modal-head-sub">Mantenimientos</p>
                <h3 className="modal-head-title">{editId !== null ? "Editar mantenimiento" : "Nuevo mantenimiento"}</h3>
              </div>
              <button className="modal-x" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body">
                <div className="fgrid">
                  <div className="fgfull">
                    <label className="flabel">Cliente</label>
                    <select className="finput" value={form.cod_Cliente}
                      onChange={e => setForm({ ...form, cod_Cliente: Number(e.target.value) })} required>
                      <option value={0} disabled>Seleccionar cliente</option>
                      {clientes.map(c => (
                        <option key={c.codCliente} value={c.codCliente}>
                          {c.nomRazSocial} — {c.numDocumento}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="flabel">Placa</label>
                    <input className="finput" value={form.motoPlaca}
                      onChange={e => setForm({ ...form, motoPlaca: e.target.value })} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Modelo</label>
                    <input className="finput" value={form.motoModelo}
                      onChange={e => setForm({ ...form, motoModelo: e.target.value })} required />
                  </div>
                  <div className="fgfull">
                    <label className="flabel">Descripción de avería</label>
                    <input className="finput" value={form.descripcionAveria}
                      onChange={e => setForm({ ...form, descripcionAveria: e.target.value })} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Costo mano de obra (S/)</label>
                    <input className="finput" inputMode="decimal" value={form.costoManoObra}
                      onChange={e => {
                        const v = e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
                        setForm({ ...form, costoManoObra: v === "" || v === "." ? 0 : parseFloat(v) || 0 });
                      }} required />
                  </div>
                  <div className="fg">
                    <label className="flabel">Estado</label>
                    {form.estado === "Entregado" ? (
                      <select className="finput" value="Entregado" disabled>
                        <option value="Entregado">Entregado</option>
                      </select>
                    ) : (
                      <select className="finput" value={form.estado}
                        onChange={e => setForm({ ...form, estado: e.target.value as EstadoMant })}>
                        {ESTADOS_FORM.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
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
