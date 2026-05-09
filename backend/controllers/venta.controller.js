const db = require('../db');

const getAllVentas = (req, res) => {
    const sql = `
        SELECT c.id_comprobante, c.tipo, c.serie, c.fecha, c.total, cl.nombre as cliente, u.nombre as usuario
        FROM comprobante c
        LEFT JOIN cliente cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
        ORDER BY c.id_comprobante DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
};

const createVenta = async (req, res) => {
    const { tipo, serie, id_cliente, id_usuario, total, detalles } = req.body;

    if (!detalles || detalles.length === 0) {
        return res.status(400).json({ message: 'La venta debe contener al menos un producto' });
    }

    try {
        await db.promise().query('START TRANSACTION');

        // 1. Validate Stock first
        for (const det of detalles) {
            const [rows] = await db.promise().query('SELECT stock, nombre FROM medicamento WHERE id_medicamento = ? FOR UPDATE', [det.id_medicamento]);
            if (rows.length === 0) {
                throw new Error(`Medicamento no encontrado (ID: ${det.id_medicamento})`);
            }
            if (rows[0].stock < det.cantidad) {
                throw new Error(`Stock insuficiente para el producto ${rows[0].nombre}. Disponible: ${rows[0].stock}`);
            }
        }

        // 2. Insert into comprobante
        const fecha = new Date().toISOString().slice(0, 10);
        const [compResult] = await db.promise().query(
            `INSERT INTO comprobante (tipo, serie, fecha, total, id_cliente, id_usuario) VALUES (?, ?, ?, ?, ?, ?)`,
            [tipo || 'Boleta', serie || 'B001', fecha, total, id_cliente, id_usuario]
        );
        const id_comprobante = compResult.insertId;

        // 3. Insert into detalle_comprobante & update stock
        for (const det of detalles) {
            await db.promise().query(
                `INSERT INTO detalle_comprobante (cantidad, precio, subtotal, id_comprobante, id_medicamento) VALUES (?, ?, ?, ?, ?)`,
                [det.cantidad, det.precio, det.subtotal, id_comprobante, det.id_medicamento]
            );

            await db.promise().query(
                `UPDATE medicamento SET stock = stock - ? WHERE id_medicamento = ?`,
                [det.cantidad, det.id_medicamento]
            );
        }

        await db.promise().query('COMMIT');
        res.status(201).json({ message: 'Venta registrada exitosamente', id_comprobante });
    } catch (err) {
        await db.promise().query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error al registrar la venta', error: err.message });
    }
};

module.exports = { getAllVentas, createVenta };
