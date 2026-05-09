const db = require('../db');

const getAllMedicamentos = (req, res) => {
    const sql = `
        SELECT 
            m.id_medicamento,
            m.nombre,
            m.precio,
            m.stock,
            m.fecha_vencimiento,
            m.id_laboratorio,
            m.id_categoria,
            m.id_presentacion,
            l.nombre AS laboratorio,
            c.nombre AS categoria,
            p.nombre AS presentacion
        FROM medicamento m
        LEFT JOIN laboratorio l ON m.id_laboratorio = l.id_laboratorio
        LEFT JOIN categoria c ON m.id_categoria = c.id_categoria
        LEFT JOIN presentacion p ON m.id_presentacion = p.id_presentacion
        WHERE m.estado = 1
        ORDER BY m.id_medicamento DESC
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error en servidor' });
        }
        res.json(result);
    });
};

const getMedicamentoById = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM medicamento WHERE id_medicamento = ? AND estado = 1`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error en servidor' });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: 'Medicamento no encontrado' });
        }
    });
};

const createMedicamento = (req, res) => {
    const { nombre, precio, stock, fecha_vencimiento, id_laboratorio, id_categoria, id_presentacion } = req.body;
    
    // Validaciones basicas
    if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({ message: 'Nombre, precio y stock son requeridos' });
    }

    const sql = `
        INSERT INTO medicamento (nombre, precio, stock, fecha_vencimiento, id_laboratorio, id_categoria, id_presentacion, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    db.query(sql, [nombre, precio, stock, fecha_vencimiento || null, id_laboratorio || null, id_categoria || null, id_presentacion || null], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al crear medicamento' });
        }
        res.status(201).json({ message: 'Medicamento creado exitosamente', id: result.insertId });
    });
};

const updateMedicamento = (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, fecha_vencimiento, id_laboratorio, id_categoria, id_presentacion } = req.body;

    const sql = `
        UPDATE medicamento 
        SET nombre = ?, precio = ?, stock = ?, fecha_vencimiento = ?, id_laboratorio = ?, id_categoria = ?, id_presentacion = ?
        WHERE id_medicamento = ? AND estado = 1
    `;
    db.query(sql, [nombre, precio, stock, fecha_vencimiento || null, id_laboratorio || null, id_categoria || null, id_presentacion || null, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar medicamento' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json({ message: 'Medicamento actualizado exitosamente' });
    });
};

const deleteMedicamento = (req, res) => {
    const { id } = req.params;
    // Baja lógica
    const sql = `UPDATE medicamento SET estado = 0 WHERE id_medicamento = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar medicamento' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json({ message: 'Medicamento eliminado exitosamente' });
    });
};

module.exports = {
    getAllMedicamentos,
    getMedicamentoById,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento
};
