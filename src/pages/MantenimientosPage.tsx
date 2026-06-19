import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { MantenimientoService } from "../service/MantenimientoService";
import { ClienteService } from "../service/ClienteService";
import type { Mantenimiento, MantenimientoFormData } from "../type/Mantenimiento";
import type { Cliente } from "../type/Cliente";

type MantenimientoInput = MantenimientoFormData;
type FiltroEstado = "Todos" | "Pendiente" | "En Proceso" | "Completado";

const INITIAL_FORM: MantenimientoInput = {
  cod_Cliente: 0,
  motoPlaca: "",
  motoModelo: "",
  descripcionAveria: "",
  costoManoObra: 0,
  estado: "Pendiente"
};

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<MantenimientoInput>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para controlar el filtro de la tabla
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>("Todos");

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [mantsRes, clientesRes] = await Promise.all([
        MantenimientoService.getAll(),
        ClienteService.getAll()
      ]);
      setMantenimientos(mantsRes);
      setClientes(clientesRes);
    } catch {
      setErrorMsg("Error de conexión con Taller-Service o Cliente-Service (verifica que ambos microservicios estén corriendo)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: MantenimientoInput) => ({ ...prev, [name]: value }));
  };

  const openEdit = (m: Mantenimiento) => {
    setEditingId(m.cod_Mantenimiento);
    setFormData({
      cod_Cliente: m.cod_Cliente,
      motoPlaca: m.motoPlaca,
      motoModelo: m.motoModelo,
      descripcionAveria: m.descripcionAveria,
      costoManoObra: m.costoManoObra,
      estado: m.estado
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      cod_Cliente: Number(formData.cod_Cliente) || 0,
      costoManoObra: Number(formData.costoManoObra) || 0
    };

    if (!payload.cod_Cliente) {
      alert("Selecciona un cliente registrado antes de guardar.");
      return;
    }

    try {
      if (editingId !== null) {
        await MantenimientoService.update(editingId, payload);
      } else {
        await MantenimientoService.create(payload);
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch {
      alert("Error al procesar la operación en el servidor.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(`¿Eliminar orden de mantenimiento #${id}?`)) {
      try {
        await MantenimientoService.delete(id);
        cargarDatos();
      } catch {
        alert("No se pudo eliminar el registro.");
      }
    }
  };

  // Cálculos de totales en memoria
  const totalMants = mantenimientos.length;
  const pendientes = mantenimientos.filter(m => m.estado === "Pendiente").length;
  const enProceso = mantenimientos.filter(m => m.estado === "En Proceso").length;
  const completados = mantenimientos.filter(m => m.estado === "Completado").length;

  // Filtrado lógico antes de renderizar la tabla
  const mantsFiltrados = mantenimientos.filter(m => {
    if (filtroActivo === "Todos") return true;
    return m.estado === filtroActivo;
  });

  return (
    <>
      <style>{`
        body { margin: 0; background-color: #F8FAFC; font-family: system-ui, -apple-system, sans-serif; }
        .page-wrapper { padding: 40px; width: 100%; box-sizing: border-box; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; width: 100%; }
        .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0F2744; letter-spacing: -0.5px; }
        
        /* BARRA DE FILTROS ESTILO TABS (Adios cubos IA) */
        .tabs-container { display: flex; gap: 8px; border-bottom: 1px solid #E2E8F0; margin-bottom: 20px; width: 100%; padding-bottom: 2px; }
        .tab-btn { background: none; border: none; padding: 8px 16px; font-size: 14px; font-weight: 500; color: #64748B; cursor: pointer; position: relative; transition: color 0.2s; display: flex; align-items: center; gap: 8px; }
        .tab-btn:hover { color: #0F2744; }
        .tab-btn.active { color: #0F2744; font-weight: 600; }
        .tab-btn.active::after { content: ""; position: absolute; bottom: -3px; left: 0; width: 100%; height: 2px; background: #0F2744; }
        
        /* Contador estilo píldora dentro de la pestaña */
        .tab-badge { background: #E2E8F0; color: #475569; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 10px; }
        .tab-btn.active .tab-badge { background: #0F2744; color: #fff; }

        /* Tabla */
        .custom-table { border-radius: 10px; overflow: hidden; background: #fff; border: 1px solid #DDE4ED; box-shadow: 0 4px 12px rgba(26,35,50,0.02); width: 100%; }
        .custom-table table { width: 100%; border-collapse: collapse; text-align: left; }
        .custom-table th { background: #F8FAFC; padding: 16px; font-weight: 600; font-size: 12px; color: #4A5D78; border-bottom: 1px solid #E2E8F0; text-transform: uppercase; letter-spacing: 0.5px; }
        .custom-table td { padding: 16px; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: #1E293B; vertical-align: middle; }
        .custom-table tr:hover td { background-color: #F8FAFC; }
        
        /* Quitar flechas de inputs numéricos */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        
        /* Badges de estado modernos */
        .status-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .status-pendiente { background: #FFF7ED; color: #C2410C; }
        .status-proceso { background: #EFF6FF; color: #1D4ED8; }
        .status-completado { background: #F0FDF4; color: #15803D; }
        
        /* Botones */
        .btn-primary { background: #0F2744; color: #fff; border: none; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #1A365D; }
        .btn-secondary { background: #fff; color: #475569; border: 1px solid #CBD5E1; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #F1F5F9; }
        
        .action-btn { background: none; border: none; cursor: pointer; font-size: 15px; padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }
        .btn-edit { color: #1A6FC4; background: #E8F0FE; }
        .btn-edit:hover { background: #D2E3FC; }
        .btn-del { color: #C0392B; background: #FCE8E6; margin-left: 6px; }
        .btn-del:hover { background: #FAD2CF; }

        /* Modal */
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 39, 68, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .modern-modal { background: #fff; padding: 32px; border-radius: 12px; width: 100%; max-width: 600px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #E2E8F0; }
        .modal-header-title { font-size: 1.3rem; font-weight: 700; color: #0F2744; margin: 0 0 20px 0; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; }
        .form-group { margin-bottom: 16px; }
        .modern-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #CBD5E1; font-size: 14px; color: #1E293B; box-sizing: border-box; outline: none; }
        .modern-input:focus { border-color: #1A6FC4; box-shadow: 0 0 0 3px rgba(26,111,196,0.1); }
        .input-label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block; }
        .field-hint { font-size: 12px; color: #C2410C; margin-top: 6px; }
      `}</style>

      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2 className="page-title">Gestión de Órdenes de Mantenimiento</h2>
          </div>
          <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: 600 }} onClick={() => { setEditingId(null); setFormData(INITIAL_FORM); setIsModalOpen(true); }}>
            + Registrar Nueva Orden
          </button>
        </div>

        {errorMsg && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #F87171" }}>⚠️ {errorMsg}</div>}

        <div className="tabs-container">
          <button className={`tab-btn ${filtroActivo === "Todos" ? "active" : ""}`} onClick={() => setFiltroActivo("Todos")}>
            Todos los trabajos <span className="tab-badge">{totalMants}</span>
          </button>
          <button className={`tab-btn ${filtroActivo === "Pendiente" ? "active" : ""}`} onClick={() => setFiltroActivo("Pendiente")}>
            Pendientes <span className="tab-badge">{pendientes}</span>
          </button>
          <button className={`tab-btn ${filtroActivo === "En Proceso" ? "active" : ""}`} onClick={() => setFiltroActivo("En Proceso")}>
            En Proceso <span className="tab-badge">{enProceso}</span>
          </button>
          <button className={`tab-btn ${filtroActivo === "Completado" ? "active" : ""}`} onClick={() => setFiltroActivo("Completado")}>
            Completados <span className="tab-badge">{completados}</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6B7A90", background: "#fff", borderRadius: "10px", border: "1px solid #DDE4ED" }}>
            <span style={{ fontSize: "18px" }}>Cargando datos del taller mecánico...</span>
          </div>
        ) : (
          <div className="custom-table">
            <table>
              <thead>
                <tr><th>Código</th><th>Cliente</th><th>Documento</th><th>Placa</th><th>Modelo Moto</th><th>Mano Obra</th><th>Estado</th><th style={{ textAlign: "center" }}>Acciones</th></tr>
              </thead>
              <tbody>
                {mantsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#6B7A90" }}>
                      No hay órdenes en el estado "{filtroActivo}".
                    </td>
                  </tr>
                ) : (
                  mantsFiltrados.map(m => {
                    const cliente = clientes.find(c => c.codCliente === m.cod_Cliente);
                    return (
                      <tr key={m.cod_Mantenimiento}>
                        <td><strong style={{ color: "#64748B" }}>#{m.cod_Mantenimiento}</strong></td>
                        <td style={{ fontWeight: 600, color: "#0F2744" }}>{cliente?.nomRazSocial ?? "Cliente no encontrado"}</td>
                        <td>{cliente ? `${cliente.tipoDocumento} ${cliente.numDocumento}` : "—"}</td>
                        <td><span style={{ background: "#F1F5F9", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>{m.motoPlaca}</span></td>
                        <td style={{ color: "#475569" }}>{m.motoModelo}</td>
                        <td style={{ fontWeight: 600 }}>S/ {Number(m.costoManoObra).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${m.estado === 'Completado' ? 'status-completado' :
                              m.estado === 'En Proceso' ? 'status-proceso' : 'status-pendiente'
                            }`}>
                            ● {m.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button className="action-btn btn-edit" title="Editar orden" onClick={() => openEdit(m)}>✏️</button>
                          <button className="action-btn btn-del" title="Eliminar orden" onClick={() => handleDelete(m.cod_Mantenimiento)}>🗑️</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modern-modal">
              <h3 className="modal-header-title">
                {editingId ? `📝 Modificar Orden #${editingId}` : "🛠️ Registrar Nueva Orden"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Cliente</label>
                    <select name="cod_Cliente" className="modern-input" value={formData.cod_Cliente || ""} onChange={handleChange} required>
                      <option value="" disabled>Selecciona un cliente registrado</option>
                      {clientes.map(c => (
                        <option key={c.codCliente} value={c.codCliente}>
                          {c.tipoDocumento} {c.numDocumento} — {c.nomRazSocial}
                        </option>
                      ))}
                    </select>
                    {clientes.length === 0 && (
                      <p className="field-hint">
                        No hay clientes registrados todavía. Ve a la sección Clientes y registra uno antes de crear una orden.
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="input-label">Placa Moto</label>
                    <input type="text" name="motoPlaca" className="modern-input" placeholder="Ej. 1234-ABC" value={formData.motoPlaca} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Modelo</label>
                    <input type="text" name="motoModelo" className="modern-input" placeholder="Ej. Honda CBX" value={formData.motoModelo} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Mano de Obra (S/)</label>
                    <input type="number" step="0.01" min="0" name="costoManoObra" className="modern-input" value={formData.costoManoObra} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Estado</label>
                    <select name="estado" className="modern-input" value={formData.estado} onChange={handleChange}>
                      <option value="Pendiente">⏳ Pendiente</option>
                      <option value="En Proceso">⚙️ En Proceso</option>
                      <option value="Completado">✅ Completado</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Descripción Avería</label>
                    <textarea name="descripcionAveria" className="modern-input" placeholder="Detalle técnico..." value={formData.descripcionAveria} onChange={handleChange} required rows={3} style={{ resize: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: "16px", borderTop: "1px solid #F1F5F9" }}>
                  <button type="button" className="btn-secondary" style={{ borderRadius: "8px", padding: "10px 18px", fontWeight: 600 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{ borderRadius: "8px", padding: "10px 22px", fontWeight: 600 }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
