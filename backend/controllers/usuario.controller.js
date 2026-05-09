const db = require('../db');

const getAllUsuarios = (req, res) => {
    const sql = `
        SELECT u.id_usuario, u.nombre, u.correo, u.id_cargo, c.nombre as cargo_nombre 
        FROM usuario u
        LEFT JOIN cargo c ON u.id_cargo = c.id_cargo
        WHERE u.estado = 1
        ORDER BY u.id_usuario DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error en servidor', error: err });
        res.json(result);
    });
};

const createUsuario = (req, res) => {
    const { nombre, correo, password, id_cargo } = req.body;
    if (!nombre || !password) return res.status(400).json({ message: 'Nombre y password son requeridos' });

    const sql = `INSERT INTO usuario (nombre, correo, password, id_cargo, estado) VALUES (?, ?, ?, ?, 1)`;
    db.query(sql, [nombre, correo || null, password, id_cargo || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al crear usuario', error: err });
        res.status(201).json({ message: 'Usuario creado exitosamente', id: result.insertId });
    });
};

const updateUsuario = (req, res) => {
    const { id } = req.params;
    const { nombre, correo, password, id_cargo } = req.body;
    
    if (!nombre) return res.status(400).json({ message: 'Nombre es requerido' });

    let sql = `UPDATE usuario SET nombre = ?, correo = ?, id_cargo = ?`;
    const params = [nombre, correo || null, id_cargo || null];

    if (password) {
        sql += `, password = ?`;
        params.push(password);
    }
    
    sql += ` WHERE id_usuario = ? AND estado = 1`;
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar usuario', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado exitosamente' });
    });
};

const deleteUsuario = (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE usuario SET estado = 0 WHERE id_usuario = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar usuario', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado exitosamente' });
    });
};

module.exports = { getAllUsuarios, createUsuario, updateUsuario, deleteUsuario };
