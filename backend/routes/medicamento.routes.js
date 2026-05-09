const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamento.controller');

router.get('/', medicamentoController.getAllMedicamentos);
router.get('/:id', medicamentoController.getMedicamentoById);
router.post('/', medicamentoController.createMedicamento);
router.put('/:id', medicamentoController.updateMedicamento);
router.delete('/:id', medicamentoController.deleteMedicamento);

module.exports = router;
