import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ShoppingCart, Search, Plus, Trash2, ReceiptText, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NuevaVenta() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  
  const [idCliente, setIdCliente] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [serie, setSerie] = useState('B001');
  
  const [searchMed, setSearchMed] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClientes, resMedicamentos] = await Promise.all([
          api.get('/clientes'),
          api.get('/medicamentos')
        ]);
        setClientes(resClientes.data);
        setMedicamentos(resMedicamentos.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const getFilteredMedicamentos = () => {
    if (!searchMed) return [];
    return medicamentos.filter(m => 
      m.nombre.toLowerCase().includes(searchMed.toLowerCase()) && m.stock > 0
    ).slice(0, 5); // Limit to 5 results
  };

  const agregarAlCarrito = (medicamento) => {
    const existe = carrito.find(item => item.id_medicamento === medicamento.id_medicamento);
    if (existe) {
      if (existe.cantidad >= medicamento.stock) {
        alert('No hay suficiente stock para este producto.');
        return;
      }
      setCarrito(carrito.map(item => 
        item.id_medicamento === medicamento.id_medicamento 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        ...medicamento,
        cantidad: 1,
        subtotal: parseFloat(medicamento.precio)
      }]);
    }
    setSearchMed('');
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id_medicamento !== id));
  };

  const updateCantidad = (id, newCantidad) => {
    if (newCantidad < 1) return;
    const med = medicamentos.find(m => m.id_medicamento === id);
    if (newCantidad > med.stock) {
      alert(`Stock máximo disponible: ${med.stock}`);
      return;
    }

    setCarrito(carrito.map(item => 
      item.id_medicamento === id 
        ? { ...item, cantidad: newCantidad, subtotal: newCantidad * item.precio }
        : item
    ));
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const handleGenerarVenta = async () => {
    if (!idCliente) return alert('Seleccione un cliente');
    if (carrito.length === 0) return alert('El carrito está vacío');
    if (!user) return alert('Error de sesión. Vuelva a iniciar sesión.');

    setIsSubmitting(true);
    try {
      const payload = {
        tipo: tipoComprobante,
        serie,
        id_cliente: idCliente,
        id_usuario: user.id_usuario,
        total,
        detalles: carrito.map(item => ({
          id_medicamento: item.id_medicamento,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.subtotal
        }))
      };

      await api.post('/ventas', payload);
      alert('Venta registrada con éxito');
      
      // Reset form
      setCarrito([]);
      setIdCliente('');
      setSearchMed('');
      // Refresh stock
      const resMed = await api.get('/medicamentos');
      setMedicamentos(resMed.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-teal-600" />
            Nueva Venta
          </h1>
          <p className="text-slate-500 text-sm mt-1">Punto de venta (POS) y facturación.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Search & Cart */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          {/* Search Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0 relative z-20">
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Buscar Producto</label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Nombre del medicamento..."
                value={searchMed}
                onChange={(e) => setSearchMed(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-700"
              />
              
              {/* Search Results Dropdown */}
              {searchMed && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {getFilteredMedicamentos().length > 0 ? (
                    getFilteredMedicamentos().map(med => (
                      <div 
                        key={med.id_medicamento} 
                        onClick={() => agregarAlCarrito(med)}
                        className="px-4 py-3 hover:bg-slate-50 flex justify-between items-center cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{med.nombre}</p>
                          <p className="text-xs text-slate-500">{med.laboratorio} | {med.presentacion}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-teal-600">S/. {Number(med.precio).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Stock: {med.stock}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">No se encontraron resultados o sin stock.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-slate-500" />
                Detalle de Venta
              </h2>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full">{carrito.length} Ítems</span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                  <p>El carrito está vacío</p>
                  <p className="text-sm mt-1">Busque y seleccione productos para agregarlos</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                    <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-5">Producto</th>
                      <th className="py-3 px-5 text-center">Precio</th>
                      <th className="py-3 px-5 text-center">Cant.</th>
                      <th className="py-3 px-5 text-right">Subtotal</th>
                      <th className="py-3 px-5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map(item => (
                      <tr key={item.id_medicamento} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3 px-5">
                          <p className="font-semibold text-slate-800">{item.nombre}</p>
                        </td>
                        <td className="py-3 px-5 text-center font-medium text-slate-600">
                          S/. {Number(item.precio).toFixed(2)}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <input 
                            type="number" 
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => updateCantidad(item.id_medicamento, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border border-slate-200 rounded-lg py-1 outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="py-3 px-5 text-right font-bold text-slate-800">
                          S/. {item.subtotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <button 
                            onClick={() => eliminarDelCarrito(item.id_medicamento)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Checkout */}
        <div className="w-full lg:w-96 flex flex-col gap-6 flex-shrink-0 relative z-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Datos del Comprobante</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Cliente</label>
                <select 
                  value={idCliente} 
                  onChange={(e) => setIdCliente(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.dni ? `(${c.dni})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Comprobante</label>
                  <select 
                    value={tipoComprobante} 
                    onChange={(e) => {
                      setTipoComprobante(e.target.value);
                      setSerie(e.target.value === 'Factura' ? 'F001' : 'B001');
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700"
                  >
                    <option value="Boleta">Boleta</option>
                    <option value="Factura">Factura</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Serie</label>
                  <input 
                    type="text" 
                    value={serie} 
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 text-white mt-auto">
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Resumen de Venta</h2>
            
            <div className="flex justify-between items-end mb-6">
              <span className="text-slate-300">Total a Pagar</span>
              <div className="text-right">
                <span className="text-sm text-slate-400 mr-1">S/.</span>
                <span className="text-4xl font-bold tracking-tight text-teal-400">{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleGenerarVenta}
              disabled={isSubmitting || carrito.length === 0 || !idCliente}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 group shadow-[0_0_20px_rgba(20,184,166,0.2)]"
            >
              {isSubmitting ? 'Procesando...' : (
                <>
                  Generar Venta
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}