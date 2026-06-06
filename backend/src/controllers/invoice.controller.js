const invoiceService = require('../services/invoice.service');

async function listInvoices(req, res) {
  try {
    const result = await invoiceService.getInvoices(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getInvoice(req, res) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createInvoice(req, res) {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateInvoice(req, res) {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteInvoice(req, res) {
  try {
    await invoiceService.deleteInvoice(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSummary(req, res) {
  try {
    const summary = await invoiceService.getSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getSummary };
