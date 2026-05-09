const db = require('../db');

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    const sql = `
        SELECT u.id_usuario, u.nombre, u.correo, u.id_cargo, c.nombre as cargo_nombre 
        FROM usuario u
        LEFT JOIN cargo c ON u.id_cargo = c.id_cargo
        WHERE u.nombre = ? AND u.password = ? AND u.estado = 1
    `;

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = `jwt-${user.id_usuario}`;
            res.json({ token, user });
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas o usuario inactivo.' });
        }
    });
};

const register = (req, res) => {
    const { nombre, correo, password } = req.body;

    if (!nombre || !password) {
        return res.status(400).json({ message: 'El nombre de usuario y contraseña son obligatorios.' });
    }

    // Verificar si el usuario ya existe
    db.query('SELECT * FROM usuario WHERE nombre = ?', [nombre], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor', error: err });
        
        if (results.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        // Insertar nuevo usuario como Administrador por defecto (id_cargo puede ser null si no hay cargos obligatorios)
        const sql = `INSERT INTO usuario (nombre, correo, password, estado) VALUES (?, ?, ?, 1)`;
        db.query(sql, [nombre, correo || null, password], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al registrar usuario', error: err });
            
            res.status(201).json({ message: 'Usuario registrado exitosamente', id: result.insertId });
        });
    });
};

module.exports = {
    login,
    register
};
