import { useEffect, useRef, useState } from "react";
import { ComprobanteService } from "../service/ComprobanteService";
import { MantenimientoService } from "../service/MantenimientoService";
import { RepuestoService } from "../service/RepuestoService";
import { ClienteService } from "../service/ClienteService";
import type { Comprobante, DetalleRequest } from "../type/Comprobante";
import type { Mantenimiento } from "../type/Mantenimiento";
import type { Repuesto } from "../type/Repuesto";
import type { Cliente } from "../type/Cliente";

const FILA: DetalleRequest = { cod_Repuesto: 0, cantidad: 1 };

function formatSerie(nro: string, corr: number) {
  return `${nro}-${String(corr).padStart(8, "0")}`;
}

function getUsuarioJWT(): string {
  const token = localStorage.getItem("jwt_token");
  if (!token) return "—";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.name || payload.username || payload.sub || "—").toUpperCase();
  } catch {
    return "—";
  }
}

export default function ComprobantePage() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [mantenimientos, setMants]      = useState<Mantenimiento[]>([]);
  const [repuestos, setRepuestos]       = useState<Repuesto[]>([]);
  const [clientes, setClientes]         = useState<Cliente[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  const [modalCrear, setModalCrear]     = useState(false);
  const [codMant, setCodMant]           = useState(0);
  const [busquedaCli, setBusquedaCli]   = useState("");
  const [mostrarSug, setMostrarSug]     = useState(false);
  const searchRef                        = useRef<HTMLDivElement>(null);
  const [filas, setFilas]               = useState<DetalleRequest[]>([{ ...FILA }]);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState("");

  const [modalVer, setModalVer]         = useState<Comprobante | null>(null);
  const [search, setSearch]             = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      const [comps, mants, reps, clis] = await Promise.all([
        ComprobanteService.getAll(), MantenimientoService.getAll(),
        RepuestoService.getAll(), ClienteService.getAll(),
      ]);
      setComprobantes(comps); setMants(mants); setRepuestos(reps); setClientes(clis); setError("");
    } catch {
      setError("Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const mantsFinalizados = mantenimientos.filter(m => m.estado === "Finalizado");
  const mantSel = mantenimientos.find(m => m.cod_Mantenimiento === codMant);
  const cliSel  = clientes.find(c => c.codCliente === mantSel?.cod_Cliente);

  const sugerencias = mantsFinalizados.filter(m => {
    if (!busquedaCli.trim()) return true;
    const cli = clientes.find(c => c.codCliente === m.cod_Cliente);
    if (!cli) return false;
    const q = busquedaCli.toLowerCase();
    return cli.nomRazSocial.toLowerCase().includes(q) || cli.numDocumento.includes(q);
  });

  const seleccionarMant = (m: Mantenimiento) => {
    const cli = clientes.find(c => c.codCliente === m.cod_Cliente);
    setCodMant(m.cod_Mantenimiento);
    setBusquedaCli(cli ? cli.nomRazSocial : `Mant #${m.cod_Mantenimiento}`);
    setMostrarSug(false);
  };

  const subtotalRep = filas.reduce((acc, f) => {
    const r = repuestos.find(rp => rp.cod_Repuesto === f.cod_Repuesto);
    return acc + (r?.precioUnitario ?? 0) * f.cantidad;
  }, 0);
  const totalBruto   = (mantSel?.costoManoObra ?? 0) + subtotalRep;
  const subTotalNeto = Math.round((totalBruto / 1.18) * 100) / 100;
  const igvPreview   = Math.round((totalBruto - subTotalNeto) * 100) / 100;

  const abrirCrear = () => {
    setCodMant(0);
    setBusquedaCli("");
    setMostrarSug(false);
    setFilas([]);
    setFormError(""); setModalCrear(true);
  };

  const agregarFila = () =>
    setFilas(p => [...p, { cod_Repuesto: repuestos[0]?.cod_Repuesto ?? 0, cantidad: 1 }]);

  const quitarFila = (i: number) =>
    setFilas(p => p.filter((_, idx) => idx !== i));

  const upFila = (i: number, k: keyof DetalleRequest, v: number) =>
    setFilas(p => p.map((f, idx) => idx === i ? { ...f, [k]: v } : f));

  const guardar = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!codMant) { setFormError("Busca y selecciona un cliente con mantenimiento finalizado."); return; }
    const filasValidas = filas.filter(f => f.cod_Repuesto > 0);
    if (filasValidas.some(f => !f.cod_Repuesto)) { setFormError("Selecciona un repuesto en cada fila agregada."); return; }
    const totalPorRep: Record<number, number> = {};
    for (const f of filasValidas) {
      totalPorRep[f.cod_Repuesto] = (totalPorRep[f.cod_Repuesto] ?? 0) + f.cantidad;
    }
    for (const [codRep, total] of Object.entries(totalPorRep)) {
      const rep = repuestos.find(r => r.cod_Repuesto === Number(codRep));
      if (rep && total > rep.stock) {
        setFormError(`Stock insuficiente para "${rep.nom_Repuesto}". Disponible: ${rep.stock}, solicitado: ${total}.`);
        return;
      }
    }
    setSaving(true); setFormError("");
    try {
      await ComprobanteService.create({ cod_Mantenimiento: codMant, repuestos: filasValidas });
      if (mantSel) {
        await MantenimientoService.update(codMant, {
          cod_Cliente: mantSel.cod_Cliente,
          motoPlaca: mantSel.motoPlaca,
          motoModelo: mantSel.motoModelo,
          descripcionAveria: mantSel.descripcionAveria,
          costoManoObra: mantSel.costoManoObra,
          estado: "Entregado",
        });
      }
      setModalCrear(false); cargar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al crear comprobante.");
    } finally {
      setSaving(false);
    }
  };

  const verDetalle = async (cod: number) => {
    try { setModalVer(await ComprobanteService.getById(cod)); }
    catch { setError("Error al cargar detalle."); }
  };

  const filtrados = comprobantes.filter(c => {
    const q = search.toLowerCase();
    return (
      c.clienteNombre.toLowerCase().includes(q) ||
      c.clienteDocumento.includes(q) ||
      c.motoPlaca.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Banner */}
      <div className="mod-banner">
        <div>
          <p className="mod-eyebrow">Módulo</p>
          <h2 className="mod-title">Facturación</h2>
          <p className="mod-sub">Emisión de boletas y facturas</p>
        </div>
        <div className="mod-right">
          <button className="btn btn-primary btn-lg" onClick={abrirCrear} disabled={mantsFinalizados.length === 0}>
            + Emitir comprobante
          </button>
        </div>
      </div>

      <div className="page-content">
        {mantsFinalizados.length === 0 && !loading && (
          <div className="alert alert-warning">
            No hay mantenimientos en estado <strong>Finalizado</strong>. Cambia el estado desde el módulo Mantenimientos para poder emitir comprobantes.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="toolbar">
          <div className="search-box">
            <input
              placeholder="Buscar por nombre, RUC/DNI o placa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="count-tag">
            Mostrando <strong>{filtrados.length}</strong> de {comprobantes.length}
          </span>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="loading-ring" />
            <p className="loading-text">Cargando comprobantes...</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Serie</th>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Placa</th>
                  <th>M.O.</th>
                  <th>SubTotal</th>
                  <th>IGV</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => (
                  <tr key={c.cod_Comprobante}>
                    <td className="td-num">{c.cod_Comprobante}</td>
                    <td>
                      <span className={`badge ${c.tipoComprobante === "BOLETA" ? "badge-boleta" : "badge-factura"}`}>
                        {c.tipoComprobante}
                      </span>
                    </td>
                    <td className="td-mono">{formatSerie(c.nroSerie, c.correlativo)}</td>
                    <td className="td-bold">{c.clienteNombre}</td>
                    <td className="td-muted">{c.tipoDocumento} {c.clienteDocumento}</td>
                    <td className="td-mono">{c.motoPlaca}</td>
                    <td className="td-muted">S/ {c.costoManoObra.toFixed(2)}</td>
                    <td className="td-muted">S/ {c.subTotal.toFixed(2)}</td>
                    <td className="td-muted">S/ {c.igv.toFixed(2)}</td>
                    <td className="td-bold" style={{ color: "#1A6FC4" }}>S/ {c.total.toFixed(2)}</td>
                    <td className="td-muted">{c.fechaEmision}</td>
                    <td>
                      <button className="btn btn-edit btn-sm" onClick={() => verDetalle(c.cod_Comprobante)}>Ver</button>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={12}>{search ? "Sin resultados para la búsqueda" : "Sin comprobantes emitidos"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal crear ──────────────────────────────────────────────────────── */}
      {modalCrear && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-head">
              <div>
                <p className="modal-head-sub">Facturación</p>
                <h3 className="modal-head-title">Emitir nuevo comprobante</h3>
              </div>
              <button className="modal-x" onClick={() => setModalCrear(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body">

                {/* Buscador cliente → mantenimiento */}
                <div className="fg" style={{ marginBottom: 16 }} ref={searchRef}>
                  <label className="flabel">Cliente (estado mantenimiento: Finalizado)</label>
                  <div style={{ position: "relative", marginTop: 6 }}>
                    <input
                      className="finput"
                      placeholder="Buscar por nombre o RUC/DNI..."
                      value={busquedaCli}
                      autoComplete="off"
                      onChange={e => { setBusquedaCli(e.target.value); setCodMant(0); setMostrarSug(true); }}
                      onFocus={() => setMostrarSug(true)}
                      onBlur={() => setTimeout(() => setMostrarSug(false), 150)}
                    />
                    {mostrarSug && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                        background: "#fff", border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                        maxHeight: 220, overflowY: "auto",
                      }}>
                        {sugerencias.length === 0 ? (
                          <div style={{ padding: "10px 14px", fontSize: 13, color: "#94A3B8" }}>
                            Sin resultados
                          </div>
                        ) : sugerencias.map(m => {
                          const cli = clientes.find(c => c.codCliente === m.cod_Cliente);
                          return (
                            <div
                              key={m.cod_Mantenimiento}
                              onMouseDown={() => seleccionarMant(m)}
                              style={{
                                padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #F1F5F9",
                                background: codMant === m.cod_Mantenimiento ? "#EFF6FF" : undefined,
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                              onMouseLeave={e => (e.currentTarget.style.background = codMant === m.cod_Mantenimiento ? "#EFF6FF" : "")}
                            >
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>
                                {cli?.nomRazSocial ?? `Cliente #${m.cod_Cliente}`}
                              </div>
                              <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                                {cli?.tipoDocumento} {cli?.numDocumento}
                                &nbsp;·&nbsp;{m.motoPlaca} {m.motoModelo}
                                &nbsp;·&nbsp;S/ {m.costoManoObra.toFixed(2)} M.O.
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {mantSel && (
                    <div className="info-card">
                      <div className="info-card-field"><span>Cliente</span><strong>{cliSel?.nomRazSocial ?? "—"}</strong></div>
                      <div className="info-card-field"><span>{cliSel?.tipoDocumento}</span><strong>{cliSel?.numDocumento ?? "—"}</strong></div>
                      <div className="info-card-field"><span>Placa</span><strong>{mantSel.motoPlaca}</strong></div>
                      <div className="info-card-field"><span>Modelo</span><strong>{mantSel.motoModelo}</strong></div>
                      <div className="info-card-field"><span>Costo M.O.</span><strong>S/ {mantSel.costoManoObra.toFixed(2)}</strong></div>
                    </div>
                  )}
                </div>

                {/* Repuestos dinámicos */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="sec-label">Repuestos <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>(opcional)</span></span>
                    <button type="button" className="btn btn-success btn-sm" onClick={agregarFila}>
                      + Agregar repuesto
                    </button>
                  </div>
                  {filas.length === 0 && (
                    <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "6px 0 0", fontStyle: "italic" }}>
                      Sin repuestos — solo se cobrará la mano de obra.
                    </p>
                  )}
                  {filas.length > 0 && <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Repuesto</th>
                          <th style={{ width: 110 }}>P. unitario</th>
                          <th style={{ width: 90 }}>Cantidad</th>
                          <th style={{ width: 100 }}>Subtotal</th>
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filas.map((f, i) => {
                          const rep = repuestos.find(r => r.cod_Repuesto === f.cod_Repuesto);
                          const usadoEnOtrasFilas = filas.reduce((sum, ff, idx) =>
                            idx !== i && ff.cod_Repuesto === f.cod_Repuesto ? sum + ff.cantidad : sum, 0);
                          const disponible = (rep?.stock ?? 0) - usadoEnOtrasFilas;
                          return (
                            <tr key={i}>
                              <td style={{ padding: "8px 10px" }}>
                                <select className="finput" style={{ padding: "7px 10px" }}
                                  value={f.cod_Repuesto}
                                  onChange={e => upFila(i, "cod_Repuesto", Number(e.target.value))}>
                                  <option value={0} disabled>Seleccionar...</option>
                                  {repuestos.map(r => (
                                    <option key={r.cod_Repuesto} value={r.cod_Repuesto}>
                                      {r.nom_Repuesto} ({r.marcaRep})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: "8px 10px", color: "var(--muted)", fontSize: 13 }}>
                                S/ {(rep?.precioUnitario ?? 0).toFixed(2)}
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <input className="finput" style={{ padding: "7px 10px", textAlign: "right" }}
                                  inputMode="numeric"
                                  value={f.cantidad}
                                  onChange={e => upFila(i, "cantidad", Number(e.target.value.replace(/\D/g, "")) || 1)} />
                                {rep && (
                                  <span style={{ fontSize: 11, color: f.cantidad > disponible ? "#DC2626" : "var(--muted)", marginTop: 2, display: "block" }}>
                                    Disp: {disponible}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "8px 10px", fontWeight: 600, fontSize: 13 }}>
                                S/ {((rep?.precioUnitario ?? 0) * f.cantidad).toFixed(2)}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                <button type="button" onClick={() => quitarFila(i)}
                                  style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
                                  ×
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>}
                </div>

                {/* Preview totales */}
                {codMant > 0 && (
                  <div className="totals-box">
                    <div className="total-row"><span>Mano de obra</span><span>S/ {(mantSel?.costoManoObra ?? 0).toFixed(2)}</span></div>
                    <div className="total-row"><span>Repuestos</span><span>S/ {subtotalRep.toFixed(2)}</span></div>
                    <div className="total-row"><span style={{ color: "var(--muted)" }}>SubTotal (sin IGV)</span><span>S/ {subTotalNeto.toFixed(2)}</span></div>
                    <div className="total-row"><span style={{ color: "var(--muted)" }}>IGV 18%</span><span>S/ {igvPreview.toFixed(2)}</span></div>
                    <div className="total-row-main">
                      <span className="total-main-lbl">TOTAL</span>
                      <span className="total-main-val">S/ {totalBruto.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {formError && <div className="alert alert-error" style={{ marginTop: 12, marginBottom: 0 }}>{formError}</div>}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost btn-md" onClick={() => setModalCrear(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
                  {saving ? "Emitiendo..." : "Emitir comprobante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Ticket / Recibo térmico ──────────────────────────────────────────── */}
      {modalVer && (
        <div className="modal-overlay" onClick={() => setModalVer(null)}>
          <div className="ticket" onClick={e => e.stopPropagation()}>

            {/* Cabecera empresa */}
            <div className="tk-head">
              <p className="tk-brand">MotoSalud</p>
              <p className="tk-razon">TALLER DE MOTOS</p>
              <p className="tk-info">RUC: 20987654321</p>
              <p className="tk-info">AV. ESPAÑA - TRUJILLO</p>
            </div>

            <div className="tk-dash" />

            {/* Tipo y número */}
            <div className="tk-center">
              <p className="tk-tipo">
                {modalVer.tipoComprobante === "BOLETA" ? "BOLETA ELECTRÓNICA" : "FACTURA ELECTRÓNICA"}
              </p>
              <p className="tk-numero">{formatSerie(modalVer.nroSerie, modalVer.correlativo)}</p>
              <p className="tk-info">FECHA EMISIÓN: {modalVer.fechaEmision}</p>
            </div>

            <div className="tk-dash" />

            {/* Personal atendido */}
            <p className="tk-field"><span className="tk-key">ATENDIDO POR:</span> {getUsuarioJWT()}</p>

            <div className="tk-dash" />

            {/* Cliente */}
            <p className="tk-section">DATOS DEL CLIENTE</p>
            <p className="tk-field"><span className="tk-key">RAZÓN SOCIAL:</span> {modalVer.clienteNombre.toUpperCase()}</p>
            <p className="tk-field"><span className="tk-key">{modalVer.tipoDocumento}:</span> {modalVer.clienteDocumento}</p>

            <div className="tk-dash" />

            {/* Servicio */}
            <p className="tk-section">DATOS DEL SERVICIO</p>
            <p className="tk-field"><span className="tk-key">PLACA MOTO:</span> {modalVer.motoPlaca}</p>

            <div className="tk-dash" />

            {/* Detalle */}
            <p className="tk-section">DESCRIPCIÓN</p>
            <div className="tk-det-header">
              <span className="tk-det-name">ARTÍCULO</span>
              <span className="tk-det-um">U.M.</span>
              <span className="tk-det-qty">CANT.</span>
              <span className="tk-det-tot">TOTAL</span>
            </div>
            <div className="tk-dash-thin" />
            {modalVer.costoManoObra > 0 && (
              <div className="tk-det-row">
                <span className="tk-det-name" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  MANO DE OBRA
                  {modalVer.descripcionAveria && (
                    <span style={{ fontSize: 10, color: "#64748B", fontWeight: 400, display: "block" }}>
                      {modalVer.descripcionAveria}
                    </span>
                  )}
                </span>
                <span className="tk-det-um">UND</span>
                <span className="tk-det-qty">1</span>
                <span className="tk-det-tot">S/{modalVer.costoManoObra.toFixed(2)}</span>
              </div>
            )}
            {(modalVer.detalles ?? []).map(d => (
              <div key={d.cod_Detalle} className="tk-det-row">
                <span className="tk-det-name">{d.nom_Repuesto.toUpperCase()}</span>
                <span className="tk-det-um">UND</span>
                <span className="tk-det-qty">{d.cantidad}</span>
                <span className="tk-det-tot">S/{(d.precioUnitario * d.cantidad).toFixed(2)}</span>
              </div>
            ))}

            <div className="tk-dash" />

            {/* Totales */}
            <div className="tk-total-row"><span>OP. GRAVADAS</span><span>S/ {modalVer.subTotal.toFixed(2)}</span></div>
            <div className="tk-total-row tk-muted"><span>IGV 18%</span><span>S/ {modalVer.igv.toFixed(2)}</span></div>

            <div className="tk-dash" />

            <div className="tk-total-final">
              <span>IMPORTE TOTAL A PAGAR</span>
              <span>S/ {modalVer.total.toFixed(2)}</span>
            </div>

            <div className="tk-dash" />

            <p className="tk-footer">¡Gracias por su preferencia!</p>

            <button
              className="btn btn-ghost btn-sm"
              style={{ display: "block", margin: "16px auto 0" }}
              onClick={() => setModalVer(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
