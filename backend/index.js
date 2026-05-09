const express = require('express');
const cors = require('cors');

const app = express();

const db = require('./db');

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const medicamentoRoutes = require('./routes/medicamento.routes');
const clienteRoutes = require('./routes/cliente.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const catalogoRoutes = require('./routes/catalogo.routes');
const ventaRoutes = require('./routes/venta.routes');

app.use('/api/auth', authRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/ventas', ventaRoutes);

app.get('/', (req, res) => {
    res.send('Backend Nova Salud funcionando correctamente');
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en puerto 3000');
});