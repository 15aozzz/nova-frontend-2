import { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserCog, Plus, Pencil, Trash2, Search, X } from 'lucide-react';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    id_cargo: ''
  });

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCargos = async () => {
    try {
      const res = await api.get('/catalogos/cargos');
      setCargos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchCargos();
  }, []);

  const openModal = (usuario = null) => {
    if (usuario) {
      setEditingId(usuario.id_usuario);
      setFormData({
        nombre: usuario.nombre,
        correo: usuario.correo || '',
        password: '', // Don't show existing password
        id_cargo: usuario.id_cargo || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', correo: '', password: '', id_cargo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.id_cargo) payload.id_cargo = null;
      if (editingId && !payload.password) delete payload.password;

      if (editingId) {
        await api.put(`/usuarios/${editingId}`, payload);
      } else {
        await api.post('/usuarios', payload);
      }
      closeModal();
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el usuario');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        fetchUsuarios();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar');
      }
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (u.correo && u.correo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-teal-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 text-sm mt-1">Administra los accesos al sistema.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center">
        <div className="relative w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..."
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
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6">Correo</th>
                <th className="py-4 px-6">Cargo</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">Cargando usuarios...</td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">No se encontraron usuarios.</td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id_usuario} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-slate-500 font-medium">#{usuario.id_usuario}</td>
                    <td className="py-3 px-6 font-medium text-slate-800">{usuario.nombre}</td>
                    <td className="py-3 px-6 text-slate-600">{usuario.correo || '-'}</td>
                    <td className="py-3 px-6 text-slate-600">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                        {usuario.cargo_nombre || 'Sin Cargo'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(usuario)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(usuario.id_usuario)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nombre Completo <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                  <input type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Contraseña {editingId && <span className="text-xs text-slate-400 font-normal">(Dejar en blanco para no cambiar)</span>} {!editingId && <span className="text-red-500">*</span>}</label>
                  <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Cargo</label>
                  <select value={formData.id_cargo} onChange={e => setFormData({...formData, id_cargo: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
                    <option value="">Seleccione...</option>
                    {cargos.map(c => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-teal-600/20">
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}