import { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import { ComprobanteService } from "../service/ComprobanteService";
import { SunatService } from "../service/SunatService";
import type { Comprobante } from "../type/Comprobante";
import type { EnvioSunat } from "../type/EnvioSunat";

function formatSerie(nro: string, corr: number) {
  return `${nro}-${String(corr).padStart(8, "0")}`;
}


const CSS = `
  .sunat-page { min-height: 100vh; background: #EEF2F7; }

  /* ── Banner ── */
  .sunat-banner {
    background: #0B1E38;
    background-image: repeating-linear-gradient(
      -55deg, transparent 0, transparent 18px,
      rgba(255,255,255,0.013) 18px, rgba(255,255,255,0.013) 19px
    );
    padding: 28px 40px 24px;
    display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: 2px solid #1A6FC4;
  }
  .sunat-banner-module { font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #1A6FC4; margin-bottom: 6px; }
  .sunat-banner-title  { font-size: 21px; font-weight: 700; color: #fff; margin: 0; letter-spacing: -0.3px; }
  .sunat-banner-sub    { font-size: 12px; color: #475569; margin: 5px 0 0; }

  .sunat-badge-info {
    background: rgba(26,111,196,0.12); border: 1px solid rgba(26,111,196,0.25);
    color: #93C5FD; padding: 8px 16px; font-size: 12px; font-weight: 600;
    letter-spacing: 0.3px;
  }

  /* ── Content ── */
  .sunat-content { padding: 24px 40px; }

  .sunat-error { background: #FEF2F2; border-left: 3px solid #DC2626; color: #991B1B; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; font-weight: 500; }

  /* ── Toolbar / Tabs ── */
  .sunat-toolbar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; }
  .sunat-tabs { display: flex; }
  .sunat-tab {
    background: none; border: none; padding: 10px 16px;
    font-size: 13px; font-weight: 500; color: #64748B;
    cursor: pointer; position: relative; transition: color 0.15s;
    font-family: inherit; display: flex; align-items: center; gap: 8px;
  }
  .sunat-tab:hover { color: #0F2744; }
  .sunat-tab.active { color: #0F2744; font-weight: 600; }
  .sunat-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #1A6FC4; }
  .sunat-badge { background: #E2E8F0; color: #64748B; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 2px; }
  .sunat-tab.active .sunat-badge { background: #1A6FC4; color: #fff; }

  /* ── Tabla ── */
  .sunat-table-wrap { background: #fff; border: 1px solid #DDE4ED; border-top: none; }
  .sunat-table { width: 100%; border-collapse: collapse; }
  .sunat-table th { background: #F4F7FB; padding: 11px 16px; font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.7px; border-bottom: 1px solid #E2E8F0; text-align: left; }
  .sunat-table td { padding: 13px 16px; border-bottom: 1px solid #F1F5F9; font-size: 13.5px; color: #1A2332; vertical-align: middle; }
  .sunat-table tr:last-child td { border-bottom: none; }
  .sunat-table tr:hover td { background: #F8FAFC; }

  .sunat-id    { color: #94A3B8; font-weight: 600; font-size: 12px; }
  .sunat-name  { font-weight: 600; color: #0B1E38; }
  .sunat-muted { color: #64748B; font-size: 13px; }
  .sunat-total { font-weight: 700; color: #0B1E38; }

  .sunat-badge-boleta  { background: #EFF6FF; color: #1E40AF; border-left: 2px solid #3B82F6; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }
  .sunat-badge-factura { background: #FFF7ED; color: #92400E; border-left: 2px solid #F59E0B; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }

  /* Estados SUNAT */
  .estado-aceptado    { background: #F0FDF4; color: #166534; border-left: 2px solid #22C55E; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }
  .estado-rechazado   { background: #FEF2F2; color: #991B1B; border-left: 2px solid #EF4444; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }
  .estado-error       { background: #FFF7ED; color: #92400E; border-left: 2px solid #F97316; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }
  .estado-procesando  { background: #EFF6FF; color: #1D4ED8; border-left: 2px solid #3B82F6; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }
  .estado-pendiente   { background: #F8FAFC; color: #64748B; border-left: 2px solid #CBD5E1; padding: 3px 9px; font-size: 11.5px; font-weight: 700; display: inline-block; }

  /* Botones de acción */
  .sunat-btn-enviar, .sunat-btn-reenviar, .sunat-btn-pdf {
    padding: 6px 14px; font-size: 12px; font-weight: 700;
    border: none; cursor: pointer; font-family: inherit;
    transition: background 0.12s; border-radius: 0;
    min-width: 82px; text-align: center; line-height: 1.4;
  }
  .sunat-btn-enviar { background: #1A6FC4; color: #fff; }
  .sunat-btn-enviar:hover:not(:disabled) { background: #1560AA; }
  .sunat-btn-enviar:disabled { opacity: 0.5; cursor: not-allowed; }

  .sunat-btn-reenviar { background: #F1F5F9; color: #475569; }
  .sunat-btn-reenviar:hover:not(:disabled) { background: #E2E8F0; }
  .sunat-btn-reenviar:disabled { background: #F1F5F9; color: #94A3B8; cursor: default; opacity: 1; }

  .sunat-btn-pdf { background: #F0FDF4; color: #166534; min-width: 54px; margin-left: 0; }
  .sunat-btn-pdf:hover:not(:disabled) { background: #DCFCE7; }
  .sunat-btn-pdf:disabled { opacity: 0.38; cursor: not-allowed; }

  .sunat-acciones { display: flex; justify-content: flex-end; align-items: center; gap: 6px; }

  .sunat-empty { text-align: center; padding: 60px 24px; color: #94A3B8; font-size: 13.5px; }

  /* Modal detalle envío */
  .sunat-overlay { position: fixed; inset: 0; background: rgba(5,15,30,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
  .sunat-modal { background: #fff; width: 100%; max-width: 580px; box-shadow: 0 24px 64px rgba(0,0,0,0.22); border: 1px solid #CBD5E1; border-radius: 0; }
  .sunat-modal-hd { background: #0B1E38; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1A6FC4; }
  .sunat-modal-hd-title { font-size: 15px; font-weight: 700; color: #fff; }
  .sunat-modal-close { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14); color: #94A3B8; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; transition: all 0.12s; border-radius: 0; }
  .sunat-modal-close:hover { background: rgba(255,255,255,0.14); color: #fff; }
  .sunat-modal-body { padding: 22px 24px; }
  .sunat-modal-ft { padding: 14px 24px; border-top: 1px solid #E2E8F0; display: flex; justify-content: flex-end; background: #F8FAFC; }

  .sunat-detail-row { display: flex; gap: 12px; margin-bottom: 12px; }
  .sunat-detail-label { font-size: 10.5px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px; }
  .sunat-detail-value { font-size: 13.5px; color: #1A2332; font-weight: 500; }
  .sunat-detail-block { flex: 1; }
  .sunat-respuesta-box { background: #F4F7FB; border: 1px solid #E2E8F0; padding: 12px 14px; font-size: 12px; font-family: monospace; color: #334155; max-height: 160px; overflow-y: auto; word-break: break-all; margin-top: 14px; }

  .sunat-xml-section { margin-top: 16px; }
  .sunat-xml-title { font-size: 10.5px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; }
  .sunat-xml-file {
    display: flex; align-items: center; gap: 10px;
    background: #F8FAFC; border: 1px solid #E2E8F0;
    border-left: 3px solid #1A6FC4;
    padding: 10px 14px; margin-bottom: 8px;
  }
  .sunat-xml-file.cdr-file { border-left-color: #22C55E; }
  .sunat-xml-icon { font-size: 16px; flex-shrink: 0; }
  .sunat-xml-info { flex: 1; min-width: 0; }
  .sunat-xml-name { font-size: 12px; font-family: monospace; font-weight: 700; color: #0F172A; word-break: break-all; }
  .sunat-xml-path { font-size: 10.5px; color: #64748B; margin-top: 2px; font-family: monospace; word-break: break-all; }
  .sunat-xml-tag { font-size: 10px; font-weight: 700; padding: 2px 7px; flex-shrink: 0; }
  .sunat-xml-tag.xml  { background: #EFF6FF; color: #1E40AF; }
  .sunat-xml-tag.zip  { background: #F0FDF4; color: #166534; }

  .sunat-btn-close { background: #1A6FC4; color: #fff; border: none; padding: 9px 20px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.15s; border-radius: 0; }
  .sunat-btn-close:hover { background: #1560AA; }

`;

type TabType = "comprobantes" | "historial";

const estadoClass = (estado: string) => {
  switch (estado?.toUpperCase()) {
    case "ACEPTADO":    return "estado-aceptado";
    case "RECHAZADO":   return "estado-rechazado";
    case "ERROR_INTERNO": return "estado-error";
    case "PROCESANDO":  return "estado-procesando";
    default:            return "estado-pendiente";
  }
};

export const SunatPage = () => {
  const [tab, setTab] = useState<TabType>("comprobantes");
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [envios, setEnvios] = useState<EnvioSunat[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [enviando, setEnviando] = useState<number | null>(null);
  const [detalleEnvio, setDetalleEnvio] = useState<EnvioSunat | null>(null);
  const [ticketComp, setTicketComp] = useState<Comprobante | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [search, setSearch] = useState("");

  const cargarDatos = async () => {
    setLoading(true); setErrorMsg("");
    try {
      const [compros, envs] = await Promise.all([
        ComprobanteService.getAll(),
        SunatService.listar(),
      ]);
      setComprobantes(compros);
      setEnvios(envs);
    } catch (err: any) {
      setErrorMsg(err.message || "Error de conexión con los microservicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // Mapa idFactura → último envío para saber el estado de cada comprobante
  const envioMap = useMemo(() => {
    const m: Record<number, EnvioSunat> = {};
    envios.forEach(e => { m[e.idFactura] = e; });
    return m;
  }, [envios]);

  const compsFiltrados = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return comprobantes;
    return comprobantes.filter(c => {
      const serieCompleta = `${c.nroSerie}-${String(c.correlativo).padStart(8, "0")}`;
      return (
        c.clienteNombre.toLowerCase().includes(q) ||
        c.clienteDocumento.includes(q) ||
        serieCompleta.toLowerCase().includes(q)
      );
    });
  }, [comprobantes, search]);

  const enviosFiltrados = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return envios;
    return envios.filter(e => {
      const serieCompleta = `${e.serie}-${e.numero}`;
      const comp = comprobantes.find(c => c.cod_Comprobante === e.idFactura);
      return (
        serieCompleta.toLowerCase().includes(q) ||
        (comp?.clienteNombre.toLowerCase().includes(q) ?? false) ||
        (comp?.clienteDocumento.includes(q) ?? false)
      );
    });
  }, [envios, comprobantes, search]);

  const handleEnviar = async (idFactura: number) => {
    setEnviando(idFactura);
    try {
      await SunatService.enviar(idFactura);
      await cargarDatos();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al enviar a SUNAT.");
      await cargarDatos();
    } finally {
      setEnviando(null);
    }
  };

  const verTicket = async (idFactura: number) => {
    setLoadingTicket(true);
    try {
      const comp = await ComprobanteService.getById(idFactura);
      setTicketComp(comp);
    } catch {
      setErrorMsg("No se pudo cargar el comprobante.");
    } finally {
      setLoadingTicket(false);
    }
  };


  const generarPDF = (c: Comprobante) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const RUC_EMISOR = "10730357431";
    const serie = c.tipoComprobante === "FACTURA" ? "F001" : "B001";
    const correlativo = String(c.cod_Comprobante).padStart(8, "0");
    const serieCorrelativo = `${serie}-${correlativo}`;

    // Marco exterior
    doc.setDrawColor(44, 62, 80);
    doc.rect(10, 10, 190, 277);

    // Caja tipo comprobante (derecha)
    doc.rect(130, 15, 65, 24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(44, 62, 80);
    doc.text(`RUC: ${RUC_EMISOR}`, 133, 21);
    doc.text(c.tipoComprobante === "FACTURA" ? "FACTURA ELECTRÓNICA" : "BOLETA ELECTRÓNICA", 133, 27);
    doc.text(serieCorrelativo, 133, 34);

    // Cabecera emisor
    doc.setFontSize(14);
    doc.text("FARMAMOTORS S.A.C.", 15, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Representación Impresa de Comprobante Electrónico", 15, 28);
    doc.text(`Emitido vía Sistema FarmaMotors — SUNAT Beta`, 15, 34);

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 45, 195, 45);

    // Datos del receptor
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(9);
    doc.text("DATOS DEL RECEPTOR", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Razón Social  : ${c.clienteNombre}`, 15, 59);
    doc.text(`Doc. Identidad: ${c.clienteDocumento}`, 15, 65);
    doc.text(`Placa Moto    : ${c.motoPlaca}`, 15, 71);
    doc.text(`Fecha Emisión : ${c.fechaEmision}`, 120, 59);
    doc.text(`Serie-Número  : ${serieCorrelativo}`, 120, 65);

    // Cabecera tabla de ítems
    doc.setFillColor(44, 62, 80);
    doc.rect(15, 78, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Cant.", 17, 83);
    doc.text("Descripción", 35, 83);
    doc.text("P. Unit.", 148, 83);
    doc.text("Importe", 174, 83);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(44, 62, 80);
    let y = 91;

    // Línea mano de obra con descripción de avería
    if (c.costoManoObra > 0) {
      const moDesc = c.descripcionAveria
        ? `MANO DE OBRA — ${c.descripcionAveria.toUpperCase()}`
        : "SERVICIO DE MANO DE OBRA - MANTENIMIENTO";
      const moLines = doc.splitTextToSize(moDesc, 108);
      doc.text("1", 18, y);
      doc.text(moLines, 35, y);
      doc.text(c.costoManoObra.toFixed(2), 148, y);
      doc.text(c.costoManoObra.toFixed(2), 174, y);
      doc.setDrawColor(230, 230, 230);
      const moHeight = moLines.length > 1 ? moLines.length * 5 : 9;
      doc.line(15, y + moHeight - 4, 195, y + moHeight - 4);
      y += moHeight;
    }

    // Líneas de repuestos
    c.detalles.forEach((d, i) => {
      const importe = (d.precioUnitario * d.cantidad).toFixed(2);
      doc.text(String(d.cantidad), 18, y);
      // Truncar descripción larga
      const desc = d.nom_Repuesto.length > 55 ? d.nom_Repuesto.substring(0, 55) + "..." : d.nom_Repuesto;
      doc.text(desc, 35, y);
      doc.text(d.precioUnitario.toFixed(2), 148, y);
      doc.text(importe, 174, y);
      doc.setDrawColor(230, 230, 230);
      doc.line(15, y + 3, 195, y + 3);
      y += 9;
      // Salto de página si se llena
      if (y > 260 && i < c.detalles.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    // Bloque de totales
    const totalY = y + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Op. Gravada (Base imponible):`, 120, totalY);
    doc.text(`S/ ${c.subTotal.toFixed(2)}`, 183, totalY, { align: "right" });
    doc.text(`I.G.V. (18%):`, 120, totalY + 7);
    doc.text(`S/ ${c.igv.toFixed(2)}`, 183, totalY + 7, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`TOTAL A PAGAR:`, 120, totalY + 15);
    doc.text(`S/ ${c.total.toFixed(2)}`, 183, totalY + 15, { align: "right" });

    // Pie
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Representación impresa válida — Consulte su CDR en www.sunat.gob.pe", 105, 282, { align: "center" });

    doc.save(`${serieCorrelativo}.pdf`);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="sunat-page">

        {/* Banner */}
        <div className="sunat-banner">
          <div>
            <div className="sunat-banner-module">Facturación Electrónica</div>
            <h2 className="sunat-banner-title">Envío a SUNAT</h2>
            <p className="sunat-banner-sub">
              Genera XML UBL, firma digital y envío por SOAP al sistema beta de SUNAT
            </p>
          </div>
        </div>

        <div className="sunat-content">
          {errorMsg && <div className="sunat-error">{errorMsg}</div>}

          {/* Tabs */}
          <div className="sunat-toolbar">
            <div className="sunat-tabs">
              <button
                className={`sunat-tab ${tab === "comprobantes" ? "active" : ""}`}
                onClick={() => { setTab("comprobantes"); setSearch(""); }}
              >
                Comprobantes
                <span className="sunat-badge">{comprobantes.length}</span>
              </button>
              <button
                className={`sunat-tab ${tab === "historial" ? "active" : ""}`}
                onClick={() => { setTab("historial"); setSearch(""); }}
              >
                Historial de envíos
                <span className="sunat-badge">{envios.length}</span>
              </button>
            </div>
            <input
              placeholder="Buscar por cliente o serie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "7px 12px", fontSize: 13, border: "1px solid #E2E8F0",
                borderRadius: 7, outline: "none", fontFamily: "inherit",
                background: "#fff", color: "#1A2332", width: 260,
              }}
            />
          </div>

          {/* Tab 1: Comprobantes con acción de envío */}
          {tab === "comprobantes" && (
            <div className="sunat-table-wrap">
              {loading ? (
                <div className="sunat-empty">Cargando comprobantes...</div>
              ) : (
                <table className="sunat-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Serie</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th>Estado SUNAT</th>
                      <th style={{ textAlign: "right" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compsFiltrados.length === 0 ? (
                      <tr><td colSpan={8}><div className="sunat-empty">{search ? "Sin resultados." : "No hay comprobantes."}</div></td></tr>
                    ) : compsFiltrados.map(c => {
                      const envio = envioMap[c.cod_Comprobante];
                      const isEnviando = enviando === c.cod_Comprobante;
                      return (
                        <tr key={c.cod_Comprobante}>
                          <td><span className="sunat-id">#{c.cod_Comprobante}</span></td>
                          <td>
                            <span className={c.tipoComprobante === "FACTURA" ? "sunat-badge-factura" : "sunat-badge-boleta"}>
                              {c.tipoComprobante}
                            </span>
                          </td>
                          <td><span className="sunat-muted">{formatSerie(c.nroSerie, c.correlativo)}</span></td>
                          <td><span className="sunat-name">{c.clienteNombre}</span></td>
                          <td><span className="sunat-total">S/ {c.total?.toFixed(2)}</span></td>
                          <td><span className="sunat-muted">{c.fechaEmision}</span></td>
                          <td>
                            {envio ? (
                              <span className={estadoClass(envio.estado)}>{envio.estado}</span>
                            ) : (
                              <span className="estado-pendiente">NO ENVIADO</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="sunat-acciones">
                              {!envio ? (
                                <button className="sunat-btn-enviar" onClick={() => handleEnviar(c.cod_Comprobante)} disabled={isEnviando}>
                                  {isEnviando ? "Enviando..." : "Enviar"}
                                </button>
                              ) : envio.estado === "ACEPTADO" ? (
                                <button className="sunat-btn-reenviar" disabled>Enviado</button>
                              ) : (
                                <button className="sunat-btn-enviar" onClick={() => handleEnviar(c.cod_Comprobante)} disabled={isEnviando}>
                                  {isEnviando ? "Enviando..." : "Reintentar"}
                                </button>
                              )}
                              <button
                                className="sunat-btn-pdf"
                                onClick={() => generarPDF(c)}
                                disabled={envio?.estado !== "ACEPTADO"}
                                title={envio?.estado === "ACEPTADO" ? "Descargar PDF" : "Solo disponible cuando SUNAT acepte"}
                              >
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab 2: Historial de envíos */}
          {tab === "historial" && (
            <div className="sunat-table-wrap">
              {loading ? (
                <div className="sunat-empty">Cargando historial...</div>
              ) : (
                <table className="sunat-table">
                  <thead>
                    <tr>
                      <th>#Envío</th>
                      <th>#Comprobante</th>
                      <th>Tipo Doc.</th>
                      <th>Serie</th>
                      <th>Número</th>
                      <th>Estado</th>
                      <th>Código</th>
                      <th>Fecha envío</th>
                      <th style={{ textAlign: "right" }}>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enviosFiltrados.length === 0 ? (
                      <tr><td colSpan={9}><div className="sunat-empty">{search ? "Sin resultados." : "Sin envíos registrados."}</div></td></tr>
                    ) : enviosFiltrados.map(e => (
                      <tr key={e.idEnvio}>
                        <td><span className="sunat-id">#{e.idEnvio}</span></td>
                        <td><span className="sunat-muted">#{e.idFactura}</span></td>
                        <td><span className="sunat-muted">{e.tipoDocumento === "01" ? "Factura" : e.tipoDocumento === "03" ? "Boleta" : e.tipoDocumento}</span></td>
                        <td><span className="sunat-muted">{e.serie}</span></td>
                        <td><span className="sunat-muted">{e.numero}</span></td>
                        <td><span className={estadoClass(e.estado)}>{e.estado}</span></td>
                        <td><span className="sunat-muted">{e.codigoRespuesta}</span></td>
                        <td><span className="sunat-muted">{e.fechaEnvio?.replace("T", " ").substring(0, 19)}</span></td>
                        <td style={{ textAlign: "right" }}>
                          <div className="sunat-acciones">
                            <button className="sunat-btn-reenviar" onClick={() => setDetalleEnvio(e)}>CDR</button>
                            <button
                              className="sunat-btn-pdf"
                              onClick={() => verTicket(e.idFactura)}
                              disabled={e.estado !== "ACEPTADO" || loadingTicket}
                              title={e.estado === "ACEPTADO" ? "Ver comprobante" : "Solo disponible cuando SUNAT acepte"}
                            >
                              Ticket
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Ticket térmico del comprobante */}
        {ticketComp && (
          <div className="modal-overlay" onClick={() => setTicketComp(null)}>
            <div className="ticket" onClick={e => e.stopPropagation()}>
              <div className="tk-head">
                <p className="tk-brand">MotoSalud</p>
                <p className="tk-razon">TALLER DE MOTOS</p>
                <p className="tk-info">RUC: 20987654321</p>
                <p className="tk-info">AV. ESPAÑA - TRUJILLO</p>
              </div>
              <div className="tk-dash" />
              <div className="tk-center">
                <p className="tk-tipo">
                  {ticketComp.tipoComprobante === "BOLETA" ? "BOLETA ELECTRÓNICA" : "FACTURA ELECTRÓNICA"}
                </p>
                <p className="tk-numero">{formatSerie(ticketComp.nroSerie, ticketComp.correlativo)}</p>
                <p className="tk-info">FECHA EMISIÓN: {ticketComp.fechaEmision}</p>
              </div>
              <div className="tk-dash" />
              <p className="tk-field"><span className="tk-key">ATENDIDO POR:</span> {(ticketComp.atendidoPor || "—").toUpperCase()}</p>
              <div className="tk-dash" />
              <p className="tk-section">DATOS DEL CLIENTE</p>
              <p className="tk-field"><span className="tk-key">RAZÓN SOCIAL:</span> {ticketComp.clienteNombre.toUpperCase()}</p>
              <p className="tk-field"><span className="tk-key">{ticketComp.tipoDocumento}:</span> {ticketComp.clienteDocumento}</p>
              <div className="tk-dash" />
              <p className="tk-section">DATOS DEL SERVICIO</p>
              <p className="tk-field"><span className="tk-key">PLACA MOTO:</span> {ticketComp.motoPlaca}</p>
              <div className="tk-dash" />
              <p className="tk-section">DESCRIPCIÓN</p>
              <div className="tk-det-header">
                <span className="tk-det-name">ARTÍCULO</span>
                <span className="tk-det-um">U.M.</span>
                <span className="tk-det-qty">CANT.</span>
                <span className="tk-det-tot">TOTAL</span>
              </div>
              <div className="tk-dash-thin" />
              {ticketComp.costoManoObra > 0 && (
                <div className="tk-det-row">
                  <span className="tk-det-name" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    MANO DE OBRA
                    {ticketComp.descripcionAveria && (
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 400, display: "block" }}>
                        {ticketComp.descripcionAveria}
                      </span>
                    )}
                  </span>
                  <span className="tk-det-um">UND</span>
                  <span className="tk-det-qty">1</span>
                  <span className="tk-det-tot">S/{ticketComp.costoManoObra.toFixed(2)}</span>
                </div>
              )}
              {(ticketComp.detalles ?? []).map(d => (
                <div key={d.cod_Detalle} className="tk-det-row">
                  <span className="tk-det-name">{d.nom_Repuesto.toUpperCase()}</span>
                  <span className="tk-det-um">UND</span>
                  <span className="tk-det-qty">{d.cantidad}</span>
                  <span className="tk-det-tot">S/{(d.precioUnitario * d.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <div className="tk-dash" />
              <div className="tk-total-row"><span>OP. GRAVADAS</span><span>S/ {ticketComp.subTotal.toFixed(2)}</span></div>
              <div className="tk-total-row tk-muted"><span>IGV 18%</span><span>S/ {ticketComp.igv.toFixed(2)}</span></div>
              <div className="tk-dash" />
              <div className="tk-total-final">
                <span>IMPORTE TOTAL A PAGAR</span>
                <span>S/ {ticketComp.total.toFixed(2)}</span>
              </div>
              <div className="tk-dash" />
              <p className="tk-footer">¡Gracias por su preferencia!</p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ display: "block", margin: "16px auto 0" }}
                onClick={() => setTicketComp(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal: detalle de respuesta SUNAT */}
        {detalleEnvio && (
          <div className="sunat-overlay" onClick={e => e.target === e.currentTarget && setDetalleEnvio(null)}>
            <div className="sunat-modal">
              <div className="sunat-modal-hd">
                <span className="sunat-modal-hd-title">Detalle de Envío #{detalleEnvio.idEnvio}</span>
                <button className="sunat-modal-close" onClick={() => setDetalleEnvio(null)}>✕</button>
              </div>
              <div className="sunat-modal-body">
                <div className="sunat-detail-row">
                  <div className="sunat-detail-block">
                    <div className="sunat-detail-label">Comprobante</div>
                    <div className="sunat-detail-value">#{detalleEnvio.idFactura}</div>
                  </div>
                  <div className="sunat-detail-block">
                    <div className="sunat-detail-label">Tipo documento SUNAT</div>
                    <div className="sunat-detail-value">
                      {detalleEnvio.tipoDocumento === "01" ? "01 — Factura" : detalleEnvio.tipoDocumento === "03" ? "03 — Boleta" : detalleEnvio.tipoDocumento}
                    </div>
                  </div>
                  <div className="sunat-detail-block">
                    <div className="sunat-detail-label">Serie - Número</div>
                    <div className="sunat-detail-value">{detalleEnvio.serie}-{detalleEnvio.numero}</div>
                  </div>
                </div>
                <div className="sunat-detail-row">
                  <div className="sunat-detail-block">
                    <div className="sunat-detail-label">Estado</div>
                    <div className="sunat-detail-value">
                      <span className={estadoClass(detalleEnvio.estado)}>{detalleEnvio.estado}</span>
                    </div>
                  </div>
                  <div className="sunat-detail-block">
                    <div className="sunat-detail-label">Código respuesta</div>
                    <div className="sunat-detail-value">{detalleEnvio.codigoRespuesta}</div>
                  </div>
                  <div className="sunat-detail-block">
                    <div className="sunat-detail-label">Fecha envío</div>
                    <div className="sunat-detail-value">{detalleEnvio.fechaEnvio?.replace("T", " ").substring(0, 19)}</div>
                  </div>
                </div>
                <div>
                  <div className="sunat-detail-label">Respuesta SUNAT</div>
                  <div className="sunat-respuesta-box">
                    {detalleEnvio.descripcionRespuesta || "Sin descripción"}
                  </div>
                </div>

                {/* Archivos XML generados */}
                {(() => {
                  const RUC = "20987654321";
                  const xmlFile = `${RUC}-${detalleEnvio.tipoDocumento}-${detalleEnvio.serie}-${detalleEnvio.numero}.xml`;
                  const cdrFile = `R-${RUC}-${detalleEnvio.tipoDocumento}-${detalleEnvio.serie}-${detalleEnvio.numero}.zip`;
                  const basePath = `sunat-service/src/main/resources/facturas/`;
                  return (
                    <div className="sunat-xml-section">
                      <div className="sunat-xml-title">Archivos generados</div>
                      <div className="sunat-xml-file">
                        <span className="sunat-xml-icon" style={{ fontFamily: "monospace", fontSize: 13, color: "#1A6FC4", fontWeight: 700 }}>XML</span>
                        <div className="sunat-xml-info">
                          <div className="sunat-xml-name">{xmlFile}</div>
                          <div className="sunat-xml-path">{basePath}{xmlFile}</div>
                        </div>
                        <span className="sunat-xml-tag xml">XML UBL</span>
                      </div>
                      <div className="sunat-xml-file cdr-file">
                        <span className="sunat-xml-icon" style={{ fontFamily: "monospace", fontSize: 13, color: "#166534", fontWeight: 700 }}>ZIP</span>
                        <div className="sunat-xml-info">
                          <div className="sunat-xml-name">{cdrFile}</div>
                          <div className="sunat-xml-path">{basePath}{cdrFile}</div>
                        </div>
                        <span className="sunat-xml-tag zip">CDR ZIP</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="sunat-modal-ft">
                <button className="sunat-btn-close" onClick={() => setDetalleEnvio(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
