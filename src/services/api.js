import client from '../api/client';

export const authService = {
  login: (username, password) => 
    client.post('/auth/login', { username, password })
};

export const comprobantesService = {
  getTipos: () => client.get('/comprobantes/tipos'),
  getSerie: (id) => client.get(`/comprobantes/serie/${id}`)
};

export const clientesService = {
  getAll: (busqueda = '') => client.get(`/clientes?busqueda=${busqueda}`),
  buscar: (doc) => client.get(`/clientes/buscar?doc=${doc}`),
  crear: (data) => client.post('/clientes', data),
  actualizar: (id, data) => client.put(`/clientes/${id}`, data)
};

export const productosService = {
  getAll: () => client.get('/productos'),
  buscar: (q) => client.get(`/productos/buscar?q=${q}`),
  getPrecios: (id) => client.get(`/productos/${id}/precios`),
  crear: (data) => client.post('/productos', data),
  actualizar: (id, data) => client.put(`/productos/${id}`, data)
};

export const ventasService = {
  registrar: (data) => client.post('/ventas/registrar', data),
  getVenta: (id) => client.get(`/ventas/${id}`)
};

export const dashboardService = {
  getResumen: () => client.get('/dashboard/resumen')
};