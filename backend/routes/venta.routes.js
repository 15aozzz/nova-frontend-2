const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');

router.get('/', ventaController.getAllVentas);
router.post('/', ventaController.createVenta);

module.exports = router;
