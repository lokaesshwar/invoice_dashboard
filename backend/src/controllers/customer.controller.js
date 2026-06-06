const customerService = require('../services/customer.service');

async function listCustomers(req, res) {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCustomerProfile(req, res) {
  try {
    const profile = await customerService.getCustomerProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Customer not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listCustomers, getCustomerProfile };
