import { useEffect, useRef, useState } from "react";
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

function formatPlaca(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length <= 4) return clean;
  return clean.slice(0, 4) + "-" + clean.slice(4, 6);
}

function placaValida(p: string): boolean {
  return /^\d{4}-[A-Z]{2}$/.test(p);
}

function displayPlaca(p: string): string {
  return p === "S/P" ? "Sin placa" : p;
}

export default function MantenimientosPage() {
  const [lista, setLista]           = useState<Mantenimiento[]>([]);
  const [clientes, setClientes]     = useState<Cliente[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(false);
  const [editId, setEditId]         = useState<number | null>(null);
  const [form, setForm]             = useState<MantenimientoFormData>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState("");

  // búsqueda cliente en modal
  const [busquedaCli, setBusquedaCli]   = useState("");
  const [mostrarSugCli, setMostrarSugCli] = useState(false);
  const searchRef                         = useRef<HTMLDivElement>(null);

  // sin placa
  const [sinPlaca, setSinPlaca] = useState(false);

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
    displayPlaca(m.motoPlaca).toLowerCase().includes(search.toLowerCase()) ||
    m.motoModelo.toLowerCase().includes(search.toLowerCase()) ||
    nomCliente(m.cod_Cliente).toLowerCase().includes(search.toLowerCase())
  );

  function nomCliente(id: number) {
    return clientes.find(c => c.codCliente === id)?.nomRazSocial ?? `#${id}`;
  }

  const sugerenciasCli = clientes.filter(c => {
    if (!busquedaCli.trim()) return true;
    const q = busquedaCli.toLowerCase();
    return c.nomRazSocial.toLowerCase().includes(q) || c.numDocumento.includes(q);
  });

  const seleccionarCliente = (c: Cliente) => {
    setForm(f => ({ ...f, cod_Cliente: c.codCliente }));
    setBusquedaCli(c.nomRazSocial);
    setMostrarSugCli(false);
  };

  const abrirCrear = () => {
    setForm({ ...EMPTY });
    setBusquedaCli("");
    setMostrarSugCli(false);
    setSinPlaca(false);
    setFormError("");
    setEditId(null); setModal(true);
  };

  const abrirEditar = (m: Mantenimiento) => {
    setForm({ cod_Cliente: m.cod_Cliente, motoPlaca: m.motoPlaca, motoModelo: m.motoModelo, descripcionAveria: m.descripcionAveria, costoManoObra: m.costoManoObra, estado: m.estado });
    setBusquedaCli(nomCliente(m.cod_Cliente));
    setMostrarSugCli(false);
    setSinPlaca(m.motoPlaca === "S/P");
    setFormError("");
    setEditId(m.cod_Mantenimiento); setModal(true);
  };

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setFormError("");

    if (!form.cod_Cliente) {
      setFormError("Selecciona un cliente.");
      return;
    }
    if (!sinPlaca && !placaValida(form.motoPlaca)) {
      setFormError("Formato de placa inválido. Usa el formato 1234-AB (4 dígitos, guion, 2 letras).");
      return;
    }

    const payload = { ...form, motoPlaca: sinPlaca ? "S/P" : form.motoPlaca };

    setSaving(true);
    try {
      editId !== null
        ? await MantenimientoService.update(editId, payload)
        : await MantenimientoService.create(payload);
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
                    <td className="td-mono">{displayPlaca(m.motoPlaca)}</td>
                    <td className="td-muted">{m.motoModelo}</td>
                    <td className="td-muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.descripcionAveria}</td>
                    <td className="td-bold">S/ {m.costoManoObra.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${ESTADO_BADGE[m.estado] ?? "badge-pending"}`}>{m.estado}</span>
                    </td>
                    <td className="td-muted">{m.fechaIngreso}</td>
                    <td>
                      <div className="td-acts">
                        <button
                          className="btn btn-edit btn-sm"
                          onClick={() => abrirEditar(m)}
                          disabled={m.estado === "Entregado"}
                          title={m.estado === "Entregado" ? "No se puede editar un mantenimiento entregado" : undefined}
                        >Editar</button>
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

                  {/* Buscador cliente */}
                  <div className="fgfull" ref={searchRef}>
                    <label className="flabel">Cliente</label>
                    <div style={{ position: "relative", marginTop: 6 }}>
                      <input
                        className="finput"
                        placeholder="Buscar por nombre o RUC/DNI..."
                        value={busquedaCli}
                        autoComplete="off"
                        onChange={e => {
                          setBusquedaCli(e.target.value);
                          setForm(f => ({ ...f, cod_Cliente: 0 }));
                          setMostrarSugCli(true);
                        }}
                        onFocus={() => setMostrarSugCli(true)}
                        onBlur={() => setTimeout(() => setMostrarSugCli(false), 150)}
                      />
                      {mostrarSugCli && (
                        <div style={{
                          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                          background: "#fff", border: "1px solid #E2E8F0",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                          maxHeight: 200, overflowY: "auto",
                        }}>
                          {sugerenciasCli.length === 0 ? (
                            <div style={{ padding: "10px 14px", fontSize: 13, color: "#94A3B8" }}>Sin resultados</div>
                          ) : sugerenciasCli.map(c => (
                            <div
                              key={c.codCliente}
                              onMouseDown={() => seleccionarCliente(c)}
                              style={{
                                padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #F1F5F9",
                                background: form.cod_Cliente === c.codCliente ? "#EFF6FF" : undefined,
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                              onMouseLeave={e => (e.currentTarget.style.background = form.cod_Cliente === c.codCliente ? "#EFF6FF" : "")}
                            >
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{c.nomRazSocial}</div>
                              <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                                {c.tipoDocumento} {c.numDocumento}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Placa */}
                  <div className="fg">
                    <label className="flabel">Placa</label>
                    <input
                      className="finput"
                      placeholder="1234-AB"
                      value={sinPlaca ? "" : form.motoPlaca}
                      disabled={sinPlaca}
                      maxLength={7}
                      style={{ fontFamily: "monospace", letterSpacing: 1, ...(sinPlaca ? { background: "#F1F5F9", color: "#94A3B8" } : {}) }}
                      onChange={e => {
                        const formatted = formatPlaca(e.target.value);
                        setForm(f => ({ ...f, motoPlaca: formatted }));
                      }}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: 12.5, color: "#64748B", cursor: "pointer", userSelect: "none" }}>
                      <input
                        type="checkbox"
                        checked={sinPlaca}
                        onChange={e => {
                          setSinPlaca(e.target.checked);
                          if (e.target.checked) setForm(f => ({ ...f, motoPlaca: "S/P" }));
                          else setForm(f => ({ ...f, motoPlaca: "" }));
                        }}
                        style={{ width: 14, height: 14, cursor: "pointer" }}
                      />
                      La moto no tiene placa
                    </label>
                    {!sinPlaca && form.motoPlaca && !placaValida(form.motoPlaca) && (
                      <span style={{ fontSize: 11.5, color: "#DC2626", marginTop: 4, display: "block" }}>
                        Formato esperado: 1234-AB
                      </span>
                    )}
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

                {formError && <div className="alert alert-error" style={{ marginTop: 12, marginBottom: 0 }}>{formError}</div>}
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
