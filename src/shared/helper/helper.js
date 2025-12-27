const Counter = require('./counter.model');

async function getNextInvoiceNumber(orgId) {
  if (!orgId) {
    throw new Error('orgId is required');
  }

  const counter = await Counter.findOneAndUpdate(
    { key: `FINANCE_INVOICE_${orgId}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

function formatInvoiceNumber(seq, type) {
  const prefix = type === 'CUSTOMER' ? 'C' : 'V';
  return `${prefix}-${String(seq).padStart(4, '0')}`;
}

module.exports = {
  getNextInvoiceNumber,
  formatInvoiceNumber
};
