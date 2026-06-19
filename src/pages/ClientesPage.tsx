import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ClienteService } from "../service/ClienteService";
import type { Cliente, ClienteFormData } from "../type/Cliente";

type ClienteInput = ClienteFormData;
type FiltroTipoDoc = "Todos" | "DNI" | "RUC";

const INITIAL_FORM: ClienteInput = {
  numDocumento: "",
  nomRazSocial: "",
  telefono: "",
  direccion: "",
  tipoDocumento: "DNI"
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ClienteInput>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para controlar el filtro de la tabla
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipoDoc>("Todos");

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await ClienteService.getAll();
      setClientes(res);
    } catch {
      setErrorMsg("Error de conexión con ClienteService (Verifica que el microservicio esté corriendo en el puerto 9006)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ClienteInput) => ({ ...prev, [name]: value } as ClienteInput));
  };

  const openEdit = (c: Cliente) => {
    setEditingId(c.codCliente);
    setFormData({
      numDocumento: c.numDocumento,
      nomRazSocial: c.nomRazSocial,
      telefono: c.telefono,
      direccion: c.direccion,
      tipoDocumento: c.tipoDocumento
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await ClienteService.update(editingId, formData);
      } else {
        await ClienteService.create(formData);
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch {
      alert("Error al procesar la operación en el servidor.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(`¿Eliminar al cliente #${id}? Esta acción no se puede deshacer.`)) {
      try {
        await ClienteService.delete(id);
        cargarDatos();
      } catch {
        alert("No se pudo eliminar el cliente.");
      }
    }
  };

  // Cálculos de totales en memoria
  const totalClientes = clientes.length;
  const totalDni = clientes.filter(c => c.tipoDocumento === "DNI").length;
  const totalRuc = clientes.filter(c => c.tipoDocumento === "RUC").length;

  // Filtrado lógico antes de renderizar la tabla
  const clientesFiltrados = clientes.filter(c => {
    if (filtroActivo === "Todos") return true;
    return c.tipoDocumento === filtroActivo;
  });

  const maxDocLength = formData.tipoDocumento === "RUC" ? 11 : 8;

  return (
    <>
      <style>{`
        body { margin: 0; background-color: #F8FAFC; font-family: system-ui, -apple-system, sans-serif; }
        .page-wrapper { padding: 40px; width: 100%; box-sizing: border-box; }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; width: 100%; }
        .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0F2744; letter-spacing: -0.5px; }

        /* BARRA DE FILTROS ESTILO TABS */
        .tabs-container { display: flex; gap: 8px; border-bottom: 1px solid #E2E8F0; margin-bottom: 20px; width: 100%; padding-bottom: 2px; }
        .tab-btn { background: none; border: none; padding: 8px 16px; font-size: 14px; font-weight: 500; color: #64748B; cursor: pointer; position: relative; transition: color 0.2s; display: flex; align-items: center; gap: 8px; }
        .tab-btn:hover { color: #0F2744; }
        .tab-btn.active { color: #0F2744; font-weight: 600; }
        .tab-btn.active::after { content: ""; position: absolute; bottom: -3px; left: 0; width: 100%; height: 2px; background: #0F2744; }

        .tab-badge { background: #E2E8F0; color: #475569; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 10px; }
        .tab-btn.active .tab-badge { background: #0F2744; color: #fff; }

        /* Tabla */
        .custom-table { border-radius: 10px; overflow: hidden; background: #fff; border: 1px solid #DDE4ED; box-shadow: 0 4px 12px rgba(26,35,50,0.02); width: 100%; }
        .custom-table table { width: 100%; border-collapse: collapse; text-align: left; }
        .custom-table th { background: #F8FAFC; padding: 16px; font-weight: 600; font-size: 12px; color: #4A5D78; border-bottom: 1px solid #E2E8F0; text-transform: uppercase; letter-spacing: 0.5px; }
        .custom-table td { padding: 16px; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: #1E293B; vertical-align: middle; }
        .custom-table tr:hover td { background-color: #F8FAFC; }

        /* Badges de tipo de documento */
        .doc-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .doc-dni { background: #EFF6FF; color: #1D4ED8; }
        .doc-ruc { background: #FFF7ED; color: #C2410C; }

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
      `}</style>

      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2 className="page-title">Gestión de Clientes</h2>
          </div>
          <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: 600 }} onClick={() => { setEditingId(null); setFormData(INITIAL_FORM); setIsModalOpen(true); }}>
            + Registrar Nuevo Cliente
          </button>
        </div>

        {errorMsg && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #F87171" }}>⚠️ {errorMsg}</div>}

        <div className="tabs-container">
          <button className={`tab-btn ${filtroActivo === "Todos" ? "active" : ""}`} onClick={() => setFiltroActivo("Todos")}>
            Todos los clientes <span className="tab-badge">{totalClientes}</span>
          </button>
          <button className={`tab-btn ${filtroActivo === "DNI" ? "active" : ""}`} onClick={() => setFiltroActivo("DNI")}>
            🪪 DNI <span className="tab-badge">{totalDni}</span>
          </button>
          <button className={`tab-btn ${filtroActivo === "RUC" ? "active" : ""}`} onClick={() => setFiltroActivo("RUC")}>
            🏢 RUC <span className="tab-badge">{totalRuc}</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#6B7A90", background: "#fff", borderRadius: "10px", border: "1px solid #DDE4ED" }}>
            <span style={{ fontSize: "18px" }}>Cargando clientes...</span>
          </div>
        ) : (
          <div className="custom-table">
            <table>
              <thead>
                <tr><th>Código</th><th>Cliente / Razón Social</th><th>Tipo</th><th>N° Documento</th><th>Teléfono</th><th>Dirección</th><th style={{ textAlign: "center" }}>Acciones</th></tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#6B7A90" }}>
                      No hay clientes para el filtro "{filtroActivo}".
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map(c => (
                    <tr key={c.codCliente}>
                      <td><strong style={{ color: "#64748B" }}>#{c.codCliente}</strong></td>
                      <td style={{ fontWeight: 600, color: "#0F2744" }}>{c.nomRazSocial}</td>
                      <td>
                        <span className={`doc-badge ${c.tipoDocumento === "RUC" ? "doc-ruc" : "doc-dni"}`}>
                          {c.tipoDocumento === "RUC" ? "🏢" : "🪪"} {c.tipoDocumento}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>{c.numDocumento}</td>
                      <td style={{ color: "#475569" }}>{c.telefono}</td>
                      <td style={{ color: "#475569" }}>{c.direccion}</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="action-btn btn-edit" title="Editar cliente" onClick={() => openEdit(c)}>✏️</button>
                        <button className="action-btn btn-del" title="Eliminar cliente" onClick={() => handleDelete(c.codCliente)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modern-modal">
              <h3 className="modal-header-title">
                {editingId ? `📝 Modificar Cliente #${editingId}` : "🪪 Registrar Nuevo Cliente"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="input-label">Tipo de Documento</label>
                    <select name="tipoDocumento" className="modern-input" value={formData.tipoDocumento} onChange={handleChange}>
                      <option value="DNI">🪪 DNI</option>
                      <option value="RUC">🏢 RUC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="input-label">N° Documento</label>
                    <input
                      type="text"
                      name="numDocumento"
                      className="modern-input"
                      placeholder={formData.tipoDocumento === "RUC" ? "Ej. 20123456789" : "Ej. 74839201"}
                      value={formData.numDocumento}
                      onChange={handleChange}
                      maxLength={maxDocLength}
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Nombre o Razón Social</label>
                    <input type="text" name="nomRazSocial" className="modern-input" placeholder="Ej. María Torres / Inversiones del Sur S.A.C." value={formData.nomRazSocial} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Teléfono</label>
                    <input type="text" name="telefono" className="modern-input" placeholder="Ej. 987654321" value={formData.telefono} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Dirección</label>
                    <textarea name="direccion" className="modern-input" placeholder="Av. Ejemplo 123, Trujillo" value={formData.direccion} onChange={handleChange} required rows={3} style={{ resize: "none" }} />
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
