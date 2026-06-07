const mongoose = require('mongoose');

/**
 * Customer Model
 *
 * -  So the Customers are extracted as a separate collection to avoid data duplication.
 *   Since every customer has exactly one company (1:1), we store company inside
 *   the Customer document itself.
 * - Invoices reference Customer by ObjectId, keeping invoice documents lean and clean.
 * - This allows efficient customer profile queries (fetch all invoices by customer_id)
 *   and avoids updating company name in 2000 invoice records if it changes.
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: We will have one customer name per company
customerSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
