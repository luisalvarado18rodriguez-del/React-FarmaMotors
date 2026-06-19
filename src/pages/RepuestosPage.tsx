import { useState, useEffect } from "react";
import type { Repuesto, RepuestoFormData } from "../type/Repuesto";
import { RepuestoService } from "../service/RepuestoService";

const BLANK: RepuestoFormData = {
  nom_Repuesto: "",
  marcaRep: "",
  descripRep: "",
  precioUnitario: 0,
  stock: 0,
};

const styles = `
  .rep-page {
    padding: 36px 40px;
    max-width: 1100px;
    margin: 0 auto;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }

  .rep-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 28px;
  }

  .rep-title {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
  }

  .rep-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
  }

  .btn-primary {
    background: #0f2744;
    color: #fff;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: #1e3a5f; }

  .rep-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }

  .rep-table {
    width: 100%;
    border-collapse: collapse;
  }

  .rep-table thead tr {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .rep-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rep-table th.col-actions { text-align: right; }

  .rep-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.1s;
  }
  .rep-table tbody tr:last-child { border-bottom: none; }
  .rep-table tbody tr:hover { background: #fafcff; }

  .rep-table td {
    padding: 14px 16px;
    font-size: 14px;
    color: #334155;
    vertical-align: middle;
  }

  .td-name {
    font-weight: 600;
    color: #0f172a;
  }

  .td-price { color: #0f2744; font-weight: 500; }

  .stock-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }
  .stock-ok   { background: #dcfce7; color: #166534; }
  .stock-low  { background: #fee2e2; color: #991b1b; }

  .td-actions {
    text-align: right;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .btn-edit {
    background: #fff;
    border: 1px solid #cbd5e1;
    color: #334155;
    padding: 6px 14px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-edit:hover { border-color: #0f2744; color: #0f2744; background: #f0f4fa; }

  .btn-delete {
    background: #fff0f0;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 6px 14px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-delete:hover { background: #fee2e2; }

  .empty-row td {
    text-align: center;
    color: #94a3b8;
    padding: 48px;
    font-size: 14px;
  }

  .error-bar {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* Modal */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(2px);
  }

  .modal {
    background: #fff;
    border-radius: 12px;
    padding: 28px;
    width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }

  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 20px 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
  }

  .field label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .field input,
  .field textarea {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 9px 12px;
    font-size: 14px;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s;
    -moz-appearance: textfield;
    font-family: inherit;
  }
  .field input::-webkit-outer-spin-button,
  .field input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .field input:focus,
  .field textarea:focus { border-color: #0f2744; }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-cancel {
    background: #f1f5f9;
    border: none;
    color: #475569;
    padding: 9px 18px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-cancel:hover { background: #e2e8f0; }
`;

export default function RepuestosPage() {
  const [list, setList]       = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm]       = useState<RepuestoFormData>(BLANK);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await RepuestoService.getAll();
      setList(data);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(BLANK); setModal(true); };

  const openEdit = (r: Repuesto) => {
    setEditing(r.cod_Repuesto);
    setForm({
      nom_Repuesto:   r.nom_Repuesto,
      marcaRep:       r.marcaRep,
      descripRep:     r.descripRep,
      precioUnitario: r.precioUnitario,
      stock:          r.stock,
    });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setError(""); };

  const handleSave = async () => {
    if (!form.nom_Repuesto.trim()) return setError("El nombre es obligatorio.");
    setSaving(true);
    try {
      if (editing !== null) {
        await RepuestoService.update(editing, form);
      } else {
        await RepuestoService.create(form);
      }
      closeModal();
      load();
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este repuesto?")) return;
    try {
      await RepuestoService.delete(id);
      load();
    } catch {
      setError("No se pudo eliminar el repuesto.");
    }
  };

  // Para campos de texto
  const handleText = (key: keyof RepuestoFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  // Para campos numéricos: acepta el string directamente, sin convertir al vuelo
  const handleNum = (key: keyof RepuestoFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setForm(prev => ({ ...prev, [key]: raw === "" ? 0 : Number(raw) }));
    };

  return (
    <>
      <style>{styles}</style>

      <div className="rep-page">
        {/* Header */}
        <div className="rep-header">
          <div>
            <h2 className="rep-title">Gestión de Repuestos</h2>
            <p className="rep-subtitle">Administra el inventario de repuestos del sistema.</p>
          </div>
          <button className="btn-primary" onClick={openNew}>+ Nuevo Repuesto</button>
        </div>

        {/* Error bar (fuera del modal) */}
        {error && !modal && <div className="error-bar">{error}</div>}

        {/* Tabla */}
        <div className="rep-card">
          <table className="rep-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Precio unit.</th>
                <th>Stock</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="empty-row">
                  <td colSpan={5}>Cargando repuestos…</td>
                </tr>
              ) : list.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>No hay repuestos registrados aún.</td>
                </tr>
              ) : list.map(r => (
                <tr key={r.cod_Repuesto}>
                  <td className="td-name">{r.nom_Repuesto}</td>
                  <td>{r.marcaRep}</td>
                  <td className="td-price">S/ {Number(r.precioUnitario).toFixed(2)}</td>
                  <td>
                    <span className={`stock-badge ${r.stock <= 3 ? "stock-low" : "stock-ok"}`}>
                      {r.stock}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-edit" onClick={() => openEdit(r)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(r.cod_Repuesto)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h3 className="modal-title">{editing !== null ? "Editar repuesto" : "Nuevo repuesto"}</h3>

            {error && <div className="error-bar" style={{ marginBottom: 14 }}>{error}</div>}

            <div className="field">
              <label>Nombre</label>
              <input
                value={form.nom_Repuesto}
                onChange={handleText("nom_Repuesto")}
                placeholder="Ej. Aceite de motor"
              />
            </div>

            <div className="field">
              <label>Marca</label>
              <input
                value={form.marcaRep}
                onChange={handleText("marcaRep")}
                placeholder="Ej. Honda"
              />
            </div>

            <div className="field">
              <label>Descripción</label>
              <textarea
                value={form.descripRep}
                onChange={handleText("descripRep")}
                placeholder="Descripción opcional"
                rows={2}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="field">
                <label>Precio unitario (S/)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precioUnitario}
                  onChange={handleNum("precioUnitario")}
                  placeholder="0.00"
                />
              </div>
              <div className="field">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleNum("stock")}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
