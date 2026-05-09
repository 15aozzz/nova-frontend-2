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
        // Iniciamos transacción para que si falla el trigger o el detalle, no se guarde nada
        await db.promise().query('START TRANSACTION');

        // 1. Usar el Procedimiento Almacenado (SP) para registrar la cabecera
        await db.promise().query(
            `CALL sp_crear_comprobante(?, ?, ?, ?, ?, @out_id)`,
            [tipo || 'Boleta', serie || 'B001', id_cliente, id_usuario, total]
        );
        
        // Obtener el ID generado por el SP
        const [outIdResult] = await db.promise().query('SELECT @out_id as id_comprobante');
        const id_comprobante = outIdResult[0].id_comprobante;

        // 2. Insertar detalles
        // NOTA: Los Triggers de MariaDB (trg_validar_stock y trg_restar_stock)
        // se encargarán automáticamente de validar que haya stock y de restarlo.
        for (const det of detalles) {
            await db.promise().query(
                `INSERT INTO detalle_comprobante (cantidad, precio, subtotal, id_comprobante, id_medicamento) VALUES (?, ?, ?, ?, ?)`,
                [det.cantidad, det.precio, det.subtotal, id_comprobante, det.id_medicamento]
            );
        }

        await db.promise().query('COMMIT');
        res.status(201).json({ message: 'Venta registrada exitosamente usando SP y Triggers', id_comprobante });
    } catch (err) {
        await db.promise().query('ROLLBACK');
        console.error(err);
        
        // Si el error fue lanzado por nuestro trigger (Stock insuficiente)
        if (err.sqlState === '45000') {
            return res.status(400).json({ message: err.sqlMessage });
        }
        
        res.status(500).json({ message: 'Error al registrar la venta', error: err.message });
    }
};

module.exports = { getAllVentas, createVenta };
