const Customer = require('../models/customer.model');
const Invoice = require('../models/invoice.model');

async function getAllCustomers() {
  return Customer.find().sort({ name: 1 }).lean();
}

async function getCustomerProfile(id) {
  const customer = await Customer.findById(id).lean();
  if (!customer) return null;

  const [invoices, metrics] = await Promise.all([
    Invoice.find({ customer: id }).sort({ issueDate: -1 }).lean(),
    Invoice.aggregate([
      { $match: { customer: require('mongoose').Types.ObjectId.createFromHexString(id) } },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
          invoiceCount: { $sum: 1 },
          outstanding: {
            $sum: {
              $cond: [{ $in: ['$status', ['Sent', 'Unpaid', 'Overdue']] }, '$total', 0],
            },
          },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
          unpaid: { $sum: { $cond: [{ $eq: ['$status', 'Unpaid'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  return {
    ...customer,
    invoices,
    metrics: metrics[0] || {
      totalBilled: 0,
      totalTax: 0,
      invoiceCount: 0,
      outstanding: 0,
      paid: 0,
      unpaid: 0,
      overdue: 0,
      draft: 0,
    },
  };
}

module.exports = { getAllCustomers, getCustomerProfile };
