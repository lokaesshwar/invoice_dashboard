const mongoose = require('mongoose');

/**
 * Invoice Model
 *
 * Modeling rationale:
 * - customer field is a reference (ObjectId) to the Customer collection.
 *   This normalizes customer/company data and avoids string duplication across 2000 records.
 * - tax and total are stored (not computed on the fly) to allow efficient range queries
 *   and sorting without application-level computation.
 * - taxRate is stored as a number (0/3/5/18/28) matching the seed data.
 * - Indexes on status, customer, issueDate, dueDate support the required filter/sort operations.
 */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      enum: [0, 3, 5, 18, 28],
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Sent', 'Unpaid', 'Overdue', 'Paid', 'Void', 'Draft'],
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
