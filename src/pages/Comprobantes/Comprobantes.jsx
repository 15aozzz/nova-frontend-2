import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Receipt, Search, FileText } from 'lucide-react';

export default function Comprobantes() {
  const [comprobantes, setComprobantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchComprobantes = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/ventas');
      setComprobantes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComprobantes();
  }, []);

  const filteredComprobantes = comprobantes.filter(c => 
    (c.cliente && c.cliente.toLowerCase().includes(search.toLowerCase())) ||
    (c.serie && c.serie.toLowerCase().includes(search.toLowerCase())) ||
    c.id_comprobante.toString().includes(search)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-teal-600" />
            Comprobantes de Venta
          </h1>
          <p className="text-slate-500 text-sm mt-1">Historial de ventas registradas en el sistema.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm font-semibold">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Documento</th>
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">Cargando comprobantes...</td>
                </tr>
              ) : filteredComprobantes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">No se encontraron comprobantes.</td>
                </tr>
              ) : (
                filteredComprobantes.map((comp) => (
                  <tr key={comp.id_comprobante} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-medium">#{comp.id_comprobante}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(comp.fecha).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">{comp.cliente || 'Cliente Anónimo'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${comp.tipo === 'Factura' ? 'text-blue-500' : 'text-teal-500'}`} />
                        <span className="text-slate-600">{comp.tipo} - <span className="font-semibold">{comp.serie}-{comp.id_comprobante.toString().padStart(6, '0')}</span></span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{comp.usuario || '-'}</td>
                    <td className="py-4 px-6 text-right font-bold text-teal-700">
                      S/. {Number(comp.total).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}