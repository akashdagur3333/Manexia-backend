const CustomerInvoice = require('../model/customerInvoice.model');
const {
  getNextInvoiceNumber,
  formatInvoiceNumber
} = require('../../../../shared/helper/helper');

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      customerId,
      orderId,
      invoiceDate,
      amount,
      taxAmount
    } = req.body;

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!customerId || !orderId || !invoiceDate) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice amount'
      });
    }

    /* =====================
       AUTO INVOICE NUMBER
    ===================== */
    const seq = await getNextInvoiceNumber(orgId);
    const invoiceNumber = formatInvoiceNumber(seq, 'CUSTOMER');

    /* =====================
       CALCULATE TOTAL
    ===================== */
    const tax = typeof taxAmount === 'number' ? taxAmount : 0;
    const totalAmount = amount + tax;

    /* =====================
       CREATE INVOICE
    ===================== */
    const invoice = await CustomerInvoice.create({
      customerId,
      orderId,
      invoiceNumber,
      invoiceDate,
      amount,
      taxAmount: tax,
      totalAmount,
      paymentStatus: 'UNPAID',
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.json({
      success: true,
      message: 'Customer invoice created successfully',
      data: invoice
    });

  } catch (error) {
    console.error('CustomerInvoice Create Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create customer invoice',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const invoices = await CustomerInvoice.aggregate([
      /* =====================
         BASE FILTER
      ===================== */
      {
        $match: {
          orgId,
          isDeleted: { $ne: true }
        }
      },

      /* =====================
         CUSTOMER LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'customers',
          let: {
            cid: {
              $cond: [
                { $regexMatch: { input: '$customerId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$customerId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$cid'] },
                isDeleted: false
              }
            },
            {
              $project: { _id: 1, name: 1 }
            }
          ],
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      },

      /* =====================
         ORDER LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'customerorders',
          let: {
            oid: {
              $cond: [
                { $regexMatch: { input: '$orderId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$orderId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$oid'] },
                isDeleted: { $ne: true }
              }
            },
            {
              $project: { _id: 1, orderNumber: 1 }
            }
          ],
          as: 'order'
        }
      },
      {
        $unwind: {
          path: '$order',
          preserveNullAndEmptyArrays: true
        }
      },

      /* =====================
         FINAL RESPONSE
      ===================== */
      {
        $project: {
          _id: 1,

          invoiceNumber: 1,
          invoiceDate: 1,

          customerId: '$customer._id',
          customerName: '$customer.name',

          orderId: '$order._id',
          orderNumber: '$order.orderNumber',

          amount: 1,
          taxAmount: 1,
          totalAmount: 1,
          paymentStatus: 1,

          createdAt: 1,
          updatedAt: 1,
          createdBy: 1
        }
      },

      { $sort: { createdAt: -1 } }
    ]);

    return res.json({
      success: true,
      data: invoices
    });

  } catch (error) {
    console.error('CustomerInvoice List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer invoices',
      error: error.message
    });
  }
};

