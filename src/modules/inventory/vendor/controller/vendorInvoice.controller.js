const VendorInvoice = require('../model/vendorInvoice.model');
exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      vendorId,
      orderId,
      invoiceNumber,
      invoiceDate,
      amount,
      taxAmount
    } = req.body;

    /* =====================
       VALIDATION
    ===================== */
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor is required'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order is required'
      });
    }

    if (!invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number is required'
      });
    }

    if (!invoiceDate) {
      return res.status(400).json({
        success: false,
        message: 'Invoice date is required'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice amount'
      });
    }

    /* =====================
       DUPLICATE CHECK
    ===================== */
    const exists = await VendorInvoice.findOne({
      invoiceNumber,
      orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number already exists'
      });
    }

    /* =====================
       CALCULATE TOTAL
    ===================== */
    const tax = typeof taxAmount === 'number' ? taxAmount : 0;
    const totalAmount = amount + tax;

    /* =====================
       CREATE INVOICE
    ===================== */
    const invoice = await VendorInvoice.create({
      vendorId,
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
      message: 'Vendor invoice created successfully',
      data: invoice
    });

  } catch (error) {
    console.error('VendorInvoice Create Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create vendor invoice',
      error: error.message
    });
  }
};


exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const invoices = await VendorInvoice.aggregate([
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
         VENDOR LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'vendors',
          let: {
            vid: {
              $cond: [
                { $regexMatch: { input: '$vendorId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$vendorId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$vid'] },
                isDeleted: false
              }
            },
            {
              $project: { _id: 1, name: 1 }
            }
          ],
          as: 'vendor'
        }
      },
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true
        }
      },

      /* =====================
         ORDER LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'vendororders',
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

          vendorId: '$vendor._id',
          vendorName: '$vendor.name',

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
    console.error('VendorInvoice List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor invoices',
      error: error.message
    });
  }
};

