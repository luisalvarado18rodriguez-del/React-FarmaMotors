import { useEffect, useState } from 'react';
import { ComprobanteService } from '../service/ComprobanteService';
// IMPORTANTE: Importa ComprobanteResponse, no Comprobante
import type { ComprobanteResponse } from '../type/Comprobante';

export const ComprobantePage = () => {
  // Estado inicializado con el tipo correcto
  const [comprobantes, setComprobantes] = useState<ComprobanteResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarLista();
  }, []);

  const cargarLista = async () => {
    try {
      const data = await ComprobanteService.listar();
      setComprobantes(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Comprobantes</h1>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Placa</th>
            <th>Total</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {comprobantes.map((c) => (
            <tr key={c.cod_Comprobante}>
              <td>{c.cod_Comprobante}</td>
              <td>{c.clienteNombre}</td>
              <td>{c.motoPlaca}</td>
              {/* Se usa total de forma segura */}
              <td>S/ {c.total?.toFixed(2) || '0.00'}</td>
              <td>{c.fechaEmision}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};