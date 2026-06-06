const Invoice = require('../models/invoice.model');
const Customer = require('../models/customer.model');

/**
 * Build a MongoDB filter object from query params.
 * Supports: status, taxRate, customer (name search), issueDate range, dueDate range.
 */
async function buildFilter(query) {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.taxRate) {
    filter.taxRate = Number(query.taxRate);
  }

  if (query.search) {
    // Search by invoiceId or customer name
    const customers = await Customer.find({
      name: { $regex: query.search, $options: 'i' },
    }).select('_id');
    const customerIds = customers.map((c) => c._id);
    filter.$or = [
      { invoiceId: { $regex: query.search, $options: 'i' } },
      { customer: { $in: customerIds } },
    ];
  }

  if (query.customerId) {
    filter.customer = query.customerId;
  }

  if (query.issueDateFrom || query.issueDateTo) {
    filter.issueDate = {};
    if (query.issueDateFrom) filter.issueDate.$gte = new Date(query.issueDateFrom);
    if (query.issueDateTo) filter.issueDate.$lte = new Date(query.issueDateTo);
  }

  if (query.dueDateFrom || query.dueDateTo) {
    filter.dueDate = {};
    if (query.dueDateFrom) filter.dueDate.$gte = new Date(query.dueDateFrom);
    if (query.dueDateTo) filter.dueDate.$lte = new Date(query.dueDateTo);
  }

  return filter;
}

async function getInvoices(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  // Sort: only allow amount (total) and dueDate
  const sortField = query.sortBy === 'dueDate' ? 'dueDate' : query.sortBy === 'amount' ? 'total' : 'issueDate';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const filter = await buildFilter(query);

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('customer', 'name company')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments(filter),
  ]);

  return {
    data: invoices,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getInvoiceById(id) {
  return Invoice.findById(id).populate('customer', 'name company').lean();
}

async function createInvoice(body) {
  const tax = parseFloat(((body.amount * body.taxRate) / 100).toFixed(2));
  const total = parseFloat((body.amount + tax).toFixed(2));

  // Generate invoiceId
  const invoiceId = 'INV-' + Math.floor(1000000 + Math.random() * 9000000);

  const invoice = await Invoice.create({
    invoiceId,
    customer: body.customerId,
    amount: body.amount,
    taxRate: body.taxRate,
    tax,
    total,
    status: body.status || 'Draft',
    issueDate: new Date(body.issueDate),
    dueDate: new Date(body.dueDate),
  });

  return invoice.populate('customer', 'name company');
}

async function updateInvoice(id, body) {
  const update = { ...body };

  // Recompute tax/total if amount or taxRate changed
  if (body.amount !== undefined || body.taxRate !== undefined) {
    const existing = await Invoice.findById(id);
    const amount = body.amount ?? existing.amount;
    const taxRate = body.taxRate ?? existing.taxRate;
    update.tax = parseFloat(((amount * taxRate) / 100).toFixed(2));
    update.total = parseFloat((amount + update.tax).toFixed(2));
  }

  if (body.issueDate) update.issueDate = new Date(body.issueDate);
  if (body.dueDate) update.dueDate = new Date(body.dueDate);

  return Invoice.findByIdAndUpdate(id, update, { new: true }).populate('customer', 'name company');
}

async function deleteInvoice(id) {
  return Invoice.findByIdAndDelete(id);
}

async function getSummary() {
  const [totals, topCustomers] = await Promise.all([
    Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
          invoiceCount: { $sum: 1 },
        },
      },
    ]),
    Invoice.aggregate([
      {
        $group: {
          _id: '$customer',
          totalBilled: { $sum: '$total' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalBilled: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      { $unwind: '$customerInfo' },
      {
        $project: {
          name: '$customerInfo.name',
          company: '$customerInfo.company',
          totalBilled: 1,
          invoiceCount: 1,
        },
      },
    ]),
    Customer.countDocuments(),
  ]);

  const customerCount = await Customer.countDocuments();

  return {
    totalBilled: totals[0]?.totalBilled || 0,
    totalTax: totals[0]?.totalTax || 0,
    invoiceCount: totals[0]?.invoiceCount || 0,
    customerCount,
    topCustomers,
  };
}

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, getSummary };
