import { useEffect, useState } from 'react';
import { ProveedorService } from '../service/ProveedorService';
import type { Proveedor, ProveedorFormData } from '../type/Proveedor';

// Paleta de colores estilo Dashboard Moderno
const Theme = {
  bgContainer: '#f8fafc', // Fondo sutil slate para romper el blanco plano
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  primary: '#2563eb', // Azul moderno
  primaryHover: '#1d4ed8',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  success: '#10b981',
  border: '#e2e8f0',
  cardBg: '#ffffff'
};

export const ProveedorPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProveedorFormData>({
    ruc: '',
    nomRazSocial: '',
    telefono: '',
    direccion: '',
    correo: ''
  });

  useEffect(() => {
    cargarLista();
  }, []);

  const cargarLista = async () => {
    setLoading(true);
    try {
      const data = await ProveedorService.getAll();
      setProveedores(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId !== null) {
        await ProveedorService.update(editId, formData);
      } else { // 🌟 BUG CORREGIDO: Faltaba el 'else' explícito aquí
        await ProveedorService.create(formData);
      }
      limpiarFormulario();
      cargarLista();
    } catch (err: any) {
      setError(err.message || "Error al guardar el proveedor");
    }
  };

  const handleEdit = (p: Proveedor) => {
    setEditId(p.cod_Proveedor);
    setFormData({
      ruc: p.ruc,
      nomRazSocial: p.nomRazSocial,
      telefono: p.telefono,
      direccion: p.direccion,
      correo: p.correo
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        await ProveedorService.delete(id);
        cargarLista();
      } catch (err: any) {
        setError(err.message || "Error al eliminar el proveedor");
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({ ruc: '', nomRazSocial: '', telefono: '', direccion: '', correo: '' });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div style={{ 
      padding: '30px', 
      backgroundColor: Theme.bgContainer, 
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header de la sección */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: `1px solid ${Theme.border}`,
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: Theme.textPrimary }}>
            Gestión de Proveedores
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: Theme.textSecondary }}>
            Administra la lista de proveedores del sistema de manera centralizada.
          </p>
        </div>
        <button 
          onClick={() => { showForm ? limpiarFormulario() : setShowForm(true); }}
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            backgroundColor: showForm ? '#64748b' : Theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'background-color 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          {showForm ? 'Cancelar' : '➕ Nuevo Proveedor'}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: `1px solid ${Theme.danger}`, 
          color: Theme.danger, 
          padding: '12px 16px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          fontWeight: 500,
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Formulario Elegante */}
      {showForm && (
        <div style={{
          backgroundColor: Theme.cardBg,
          padding: '24px',
          borderRadius: '8px',
          border: `1px solid ${Theme.border}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          marginBottom: '30px',
          maxWidth: '600px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: Theme.textPrimary, fontSize: '18px', fontWeight: 600 }}>
            {editId !== null ? '📝 Editar Proveedor' : '🚀 Registrar Nuevo Proveedor'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: Theme.textSecondary }}>RUC</label>
                <input type="text" name="ruc" value={formData.ruc} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${Theme.border}`, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: Theme.textSecondary }}>Razón Social</label>
                <input type="text" name="nomRazSocial" value={formData.nomRazSocial} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${Theme.border}`, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: Theme.textSecondary }}>Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${Theme.border}`, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: Theme.textSecondary }}>Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${Theme.border}`, boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: Theme.textSecondary }}>Dirección Residencial</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${Theme.border}`, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={limpiarFormulario} style={{ padding: '10px 16px', borderRadius: '6px', border: `1px solid ${Theme.border}`, backgroundColor: 'white', color: Theme.textSecondary, cursor: 'pointer', fontWeight: 500 }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: Theme.success, color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                {editId !== null ? 'Actualizar Cambios' : 'Guardar Proveedor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla Estilizada */}
      <div style={{ 
        backgroundColor: Theme.cardBg, 
        borderRadius: '8px', 
        border: `1px solid ${Theme.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: Theme.textSecondary }}>Cargando proveedores...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: `2px solid ${Theme.border}` }}>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary, width: '60px', textAlign: 'center' }}>ID</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary }}>Razón Social</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary, textAlign: 'center' }}>RUC</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary, textAlign: 'center' }}>Teléfono</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary }}>Dirección</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary }}>Correo</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary, textAlign: 'center', width: '180px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: Theme.textSecondary, backgroundColor: '#ffffff' }}>
                    No hay proveedores registrados en este momento.
                  </td>
                </tr>
              ) : (
                proveedores.map((p, index) => (
                  <tr key={p.cod_Proveedor} style={{ 
                    borderBottom: `1px solid ${Theme.border}`,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfdfe',
                    transition: 'background-color 0.15s'
                  }}>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500, color: Theme.textSecondary }}>{p.cod_Proveedor}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: Theme.textPrimary }}>{p.nomRazSocial}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: Theme.textPrimary }}>{p.ruc}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: Theme.textSecondary }}>{p.telefono}</td>
                    <td style={{ padding: '14px 16px', color: Theme.textSecondary }}>{p.direccion}</td>
                    <td style={{ padding: '14px 16px', color: Theme.textSecondary }}>{p.correo}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleEdit(p)} 
                        style={{ 
                          marginRight: '8px', 
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: `1px solid ${Theme.border}`,
                          backgroundColor: '#f1f5f9',
                          color: Theme.textPrimary,
                          fontWeight: 500,
                          fontSize: '12px'
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(p.cod_Proveedor)} 
                        style={{ 
                          cursor: 'pointer', 
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#fef2f2',
                          color: Theme.danger,
                          fontWeight: 500,
                          fontSize: '12px'
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};