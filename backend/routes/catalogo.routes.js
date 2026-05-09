const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogo.controller');

router.get('/laboratorios', catalogoController.getLaboratorios);
router.get('/categorias', catalogoController.getCategorias);
router.get('/presentaciones', catalogoController.getPresentaciones);
router.get('/cargos', catalogoController.getCargos);

module.exports = router;
