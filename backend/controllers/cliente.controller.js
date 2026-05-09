const db = require('../db');

const getAllClientes = (req, res) => {
    const sql = `SELECT * FROM cliente WHERE estado = 1 ORDER BY id_cliente DESC`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error en servidor', error: err });
        res.json(result);
    });
};

const getClienteById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM cliente WHERE id_cliente = ? AND estado = 1`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error en servidor', error: err });
        if (result.length > 0) res.json(result[0]);
        else res.status(404).json({ message: 'Cliente no encontrado' });
    });
};

const createCliente = (req, res) => {
    const { nombre, dni, telefono, direccion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre es requerido' });

    const sql = `INSERT INTO cliente (nombre, dni, telefono, direccion, estado) VALUES (?, ?, ?, ?, 1)`;
    db.query(sql, [nombre, dni || null, telefono || null, direccion || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al crear cliente', error: err });
        res.status(201).json({ message: 'Cliente creado exitosamente', id: result.insertId });
    });
};

const updateCliente = (req, res) => {
    const { id } = req.params;
    const { nombre, dni, telefono, direccion } = req.body;
    
    if (!nombre) return res.status(400).json({ message: 'Nombre es requerido' });

    const sql = `UPDATE cliente SET nombre = ?, dni = ?, telefono = ?, direccion = ? WHERE id_cliente = ? AND estado = 1`;
    db.query(sql, [nombre, dni || null, telefono || null, direccion || null, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar cliente', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json({ message: 'Cliente actualizado exitosamente' });
    });
};

const deleteCliente = (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE cliente SET estado = 0 WHERE id_cliente = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar cliente', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json({ message: 'Cliente eliminado exitosamente' });
    });
};

module.exports = { getAllClientes, getClienteById, createCliente, updateCliente, deleteCliente };
