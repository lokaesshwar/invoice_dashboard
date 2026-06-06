const express = require('express');
const router = express.Router();
const c = require('../controllers/invoice.controller');

router.get('/summary', c.getSummary);
router.get('/', c.listInvoices);
router.get('/:id', c.getInvoice);
router.post('/', c.createInvoice);
router.put('/:id', c.updateInvoice);
router.delete('/:id', c.deleteInvoice);

module.exports = router;
