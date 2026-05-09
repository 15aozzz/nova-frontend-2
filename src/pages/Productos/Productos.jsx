import { useEffect, useState } from 'react';
import api from '../../services/api';
import { PackageSearch, Plus, Pencil, Trash2, Search, X } from 'lucide-react';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Referencias para el formulario
  const [laboratorios, setLaboratorios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    fecha_vencimiento: '',
    id_laboratorio: '',
    id_categoria: '',
    id_presentacion: ''
  });

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/medicamentos');
      setProductos(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const [labRes, catRes, presRes] = await Promise.all([
        api.get('/catalogos/laboratorios'),
        api.get('/catalogos/categorias'),
        api.get('/catalogos/presentaciones')
      ]);
      setLaboratorios(labRes.data);
      setCategorias(catRes.data);
      setPresentaciones(presRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCatalogos();
  }, []);

  const openModal = (producto = null) => {
    if (producto) {
      setEditingId(producto.id_medicamento);
      setFormData({
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock,
        fecha_vencimiento: producto.fecha_vencimiento ? producto.fecha_vencimiento.split('T')[0] : '',
        id_laboratorio: producto.id_laboratorio || '',
        id_categoria: producto.id_categoria || '',
        id_presentacion: producto.id_presentacion || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '', precio: '', stock: '', fecha_vencimiento: '',
        id_laboratorio: '', id_categoria: '', id_presentacion: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean empty strings to null for integers
      const payload = { ...formData };
      ['id_laboratorio', 'id_categoria', 'id_presentacion'].forEach(key => {
        if (!payload[key]) payload[key] = null;
      });

      if (editingId) {
        await api.put(`/medicamentos/${editingId}`, payload);
      } else {
        await api.post('/medicamentos', payload);
      }
      closeModal();
      fetchProductos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el producto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await api.delete(`/medicamentos/${id}`);
        fetchProductos();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar');
      }
    }
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageSearch className="w-7 h-7 text-teal-600" />
            Gestión de Productos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Administra el inventario de medicamentos de la botica.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm font-semibold">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">Laboratorio</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Precio</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Cargando productos...</td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">No se encontraron productos.</td>
                </tr>
              ) : (
                filteredProductos.map((producto) => (
                  <tr key={producto.id_medicamento} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-slate-500 font-medium">#{producto.id_medicamento}</td>
                    <td className="py-3 px-6 font-medium text-slate-800">{producto.nombre}</td>
                    <td className="py-3 px-6 text-slate-600">{producto.categoria || '-'}</td>
                    <td className="py-3 px-6 text-slate-600">{producto.laboratorio || '-'}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${producto.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {producto.stock} unds.
                      </span>
                    </td>
                    <td className="py-3 px-6 font-semibold text-teal-700">S/. {Number(producto.precio).toFixed(2)}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(producto)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(producto.id_medicamento)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nombre del Medicamento <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Precio (S/.) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" required value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Stock Inicial <span className="text-red-500">*</span></label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Laboratorio</label>
                  <select value={formData.id_laboratorio} onChange={e => setFormData({...formData, id_laboratorio: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
                    <option value="">Seleccione...</option>
                    {laboratorios.map(l => <option key={l.id_laboratorio} value={l.id_laboratorio}>{l.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Categoría</label>
                  <select value={formData.id_categoria} onChange={e => setFormData({...formData, id_categoria: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
                    <option value="">Seleccione...</option>
                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Presentación</label>
                  <select value={formData.id_presentacion} onChange={e => setFormData({...formData, id_presentacion: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
                    <option value="">Seleccione...</option>
                    {presentaciones.map(p => <option key={p.id_presentacion} value={p.id_presentacion}>{p.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Fecha de Vencimiento</label>
                  <input type="date" value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-teal-600/20">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}