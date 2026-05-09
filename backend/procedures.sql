USE nova_salud;

-- Eliminar si ya existen
DROP PROCEDURE IF EXISTS sp_crear_comprobante;
DROP TRIGGER IF EXISTS trg_validar_stock;
DROP TRIGGER IF EXISTS trg_restar_stock;

DELIMITER $$

-- 1. PROCEDIMIENTO ALMACENADO: Para insertar la cabecera del comprobante
CREATE PROCEDURE sp_crear_comprobante(
    IN p_tipo VARCHAR(20),
    IN p_serie VARCHAR(20),
    IN p_id_cliente INT,
    IN p_id_usuario INT,
    IN p_total DECIMAL(10,2),
    OUT p_id_comprobante INT
)
BEGIN
    INSERT INTO comprobante (tipo, serie, fecha, total, id_cliente, id_usuario)
    VALUES (p_tipo, p_serie, CURDATE(), p_total, p_id_cliente, p_id_usuario);
    
    SET p_id_comprobante = LAST_INSERT_ID();
END$$


-- 2. TRIGGER BEFORE INSERT: Para validar que haya stock antes de registrar el detalle
CREATE TRIGGER trg_validar_stock
BEFORE INSERT ON detalle_comprobante
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    
    -- Obtener el stock actual del medicamento
    SELECT stock INTO v_stock 
    FROM medicamento 
    WHERE id_medicamento = NEW.id_medicamento;
    
    -- Si la cantidad solicitada es mayor al stock, lanzar error
    IF NEW.cantidad > v_stock THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para realizar la venta del medicamento.';
    END IF;
END$$


-- 3. TRIGGER AFTER INSERT: Para descontar el stock automáticamente
CREATE TRIGGER trg_restar_stock
AFTER INSERT ON detalle_comprobante
FOR EACH ROW
BEGIN
    UPDATE medicamento 
    SET stock = stock - NEW.cantidad 
    WHERE id_medicamento = NEW.id_medicamento;
END$$

DELIMITER ;
