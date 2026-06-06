require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Customer = require('../models/customer.model');
const Invoice = require('../models/invoice.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/invoice_dashboard';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Invoice.deleteMany({});
    await Customer.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const dataPath = path.join(__dirname, 'seed-data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Build unique customer map: "name|company" -> Customer doc
    const customerMap = new Map();
    for (const record of rawData) {
      const key = `${record.customer}|${record.company}`;
      if (!customerMap.has(key)) {
        customerMap.set(key, { name: record.customer, company: record.company });
      }
    }

    // Insert customers
    const customerDocs = await Customer.insertMany([...customerMap.values()]);
    console.log(`✅ Inserted ${customerDocs.length} customers`);

    // Build lookup: "name|company" -> ObjectId
    const customerIdMap = new Map();
    for (const doc of customerDocs) {
      customerIdMap.set(`${doc.name}|${doc.company}`, doc._id);
    }

    // Build invoice documents
    const invoices = rawData.map((record) => {
      const customerId = customerIdMap.get(`${record.customer}|${record.company}`);
      return {
        invoiceId: record.invoiceId,
        customer: customerId,
        amount: record.amount,
        taxRate: record.taxRate,
        tax: record.tax,
        total: record.total,
        status: record.status,
        issueDate: new Date(record.issueDate),
        dueDate: new Date(record.dueDate),
      };
    });

    // Insert in batches of 500
    const BATCH = 500;
    for (let i = 0; i < invoices.length; i += BATCH) {
      await Invoice.insertMany(invoices.slice(i, i + BATCH));
      console.log(`✅ Inserted invoices ${i + 1}–${Math.min(i + BATCH, invoices.length)}`);
    }

    console.log(`\n🎉 Seed complete: ${customerDocs.length} customers, ${invoices.length} invoices`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
