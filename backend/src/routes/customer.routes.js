const express = require('express');
const router = express.Router();
const c = require('../controllers/customer.controller');

router.get('/', c.listCustomers);
router.get('/:id', c.getCustomerProfile);

module.exports = router;
