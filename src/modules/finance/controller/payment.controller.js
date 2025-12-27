const mongoose = require('mongoose');
const Payment = require('../model/payment.model');
const Account = require('../model/account.model');
const CustomerInvoice = require('../../inventory/customer/model/customerInvoice.model');
const VendorInvoice = require('../../inventory/vendor/model/vendorInvoice.model');

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orgId = req.user.organization.orgId;

    const {
      accountId,
      referenceType,   // CUSTOMER | VENDOR
      referenceId,
      orderId,
      type,            // IN | OUT
      amount,
      paymentMode,
      paymentDate,
      remarks
    } = req.body;

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!accountId || !referenceType || !referenceId || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero'
      });
    }

    /* =====================
       FETCH ACCOUNT
    ===================== */
    const account = await Account.findOne({
      _id: accountId,
      orgId,
      isDeleted: false
    }).session(session);

    if (!account) {
      throw new Error('Account not found');
    }

    /* =====================
       FETCH INVOICE (IF ANY)
    ===================== */
    let invoice;

    // if (orderId) {
    //   if (referenceType === 'CUSTOMER') {
    //     invoice = await CustomerInvoice.findOne({
    //       _id: orderId,
    //       orgId,
    //       isDeleted: false
    //     }).session(session);
    //   } else {
    //     invoice = await VendorInvoice.findOne({
    //       _id: orderId,
    //       orgId,
    //       isDeleted: false
    //     }).session(session);
    //   }

    //   if (!invoice) {
    //     throw new Error('Invoice not found');
    //   }

    //   if (invoice.dueAmount <= 0) {
    //     throw new Error('Invoice already fully paid');
    //   }
    // }

    /* =====================
       PAYMENT AMOUNT SAFETY
    ===================== */
    const payableAmount = invoice
      ? Math.min(amount, invoice.dueAmount)
      : amount;

    /* =====================
       CREATE PAYMENT
    ===================== */
    const payment = await Payment.create(
      [
        {
          accountId,
          referenceType,
          referenceId,
          orderId,
          type,
          amount: payableAmount,
          paymentMode,
          paymentDate: paymentDate || new Date(),
          remarks: remarks?.trim(),
          orgId,
          createdBy: {
            userId: req.user.userId,
            name: req.user.name,
            email: req.user.email
          }
        }
      ],
      { session }
    );

    /* =====================
       UPDATE ACCOUNT BALANCE
    ===================== */
    const balanceChange = type === 'IN' ? payableAmount : -payableAmount;

    await Account.findOneAndUpdate(
      { _id: accountId },
      { $inc: { currentBalance: balanceChange } },
      { session }
    );

    /* =====================
       UPDATE INVOICE
    ===================== */
    if (invoice) {
      invoice.paidAmount += payableAmount;
      invoice.dueAmount -= payableAmount;

      invoice.status =
        invoice.dueAmount === 0 ? 'PAID' : 'PARTIAL';

      await invoice.save({ session });
    }

    /* =====================
       COMMIT TRANSACTION
    ===================== */
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Payment Create Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment'
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      page = 1,
      limit = 20,
      type,            // IN | OUT
      referenceType,   // CUSTOMER | VENDOR
      accountId,
      fromDate,
      toDate
    } = req.query;

    /* =====================
       BASE FILTER
    ===================== */
    const match = {
      orgId,
      isDeleted: false
    };

    if (type && ['IN', 'OUT'].includes(type)) {
      match.type = type;
    }

    if (referenceType && ['CUSTOMER', 'VENDOR'].includes(referenceType)) {
      match.referenceType = referenceType;
    }

    if (accountId) {
      match.accountId = accountId;
    }

    if (fromDate && toDate) {
      match.paymentDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    /* =====================
       AGGREGATION PIPELINE
    ===================== */
    const pipeline = [
      { $match: match },

      /* =====================
         ACCOUNT LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'accounts',
          let: {
            aid: {
              $cond: [
                { $regexMatch: { input: '$accountId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$accountId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$aid'] },
                isDeleted: false
              }
            },
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'account'
        }
      },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },

      /* =====================
         CUSTOMER LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'customers',
          let: {
            cid: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$referenceType', 'CUSTOMER'] },
                    { $regexMatch: { input: '$referenceId', regex: /^[a-f\d]{24}$/i } }
                  ]
                },
                { $toObjectId: '$referenceId' },
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
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'customer'
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
                {
                  $and: [
                    { $eq: ['$referenceType', 'VENDOR'] },
                    { $regexMatch: { input: '$referenceId', regex: /^[a-f\d]{24}$/i } }
                  ]
                },
                { $toObjectId: '$referenceId' },
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
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'vendor'
        }
      },

      /* =====================
         ORDER LOOKUP (orderId)
      ===================== */
      {
        $lookup: {
          from: 'orders', // change to customerorders / vendororders if needed
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
            { $project: { _id: 1, orderNumber: 1, name: 1 } }
          ],
          as: 'order'
        }
      },
      { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },

      /* =====================
         FINAL RESPONSE
      ===================== */
      {
        $project: {
          _id: 1,
          paymentDate: 1,
          amount: 1,
          type: 1,
          paymentMode: 1,
          remarks: 1,

          accountId: '$account._id',
          accountName: '$account.name',

          referenceType: 1,
          referenceId: 1,
          referenceName: {
            $cond: [
              { $eq: ['$referenceType', 'CUSTOMER'] },
              { $arrayElemAt: ['$customer.name', 0] },
              { $arrayElemAt: ['$vendor.name', 0] }
            ]
          },

          orderId: '$order._id',
          orderName: {
            $ifNull: ['$order.orderNumber', '$order.name']
          },

          createdAt: 1,
          createdBy: 1
        }
      },

      { $sort: { paymentDate: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ];

    const [payments, total] = await Promise.all([
      Payment.aggregate(pipeline),
      Payment.countDocuments(match)
    ]);

    return res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Payment List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};


exports.update = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orgId = req.user.organization.orgId;
    const { id } = req.params;
    const { amount, paymentMode, paymentDate, remarks } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    /* =====================
       FETCH PAYMENT
    ===================== */
    const payment = await Payment.findOne({
      _id: id,
      orgId,
      isDeleted: false
    }).session(session);

    if (!payment) {
      throw new Error('Payment not found');
    }

    /* =====================
       FETCH ACCOUNT
    ===================== */
    const account = await Account.findOne({
      _id: payment.accountId,
      orgId,
      isDeleted: false
    }).session(session);

    if (!account) {
      throw new Error('Account not found');
    }

    /* =====================
       FETCH INVOICE (IF ANY)
    ===================== */
    let invoice = null;

    // if (payment.orderId) {
    //   invoice =
    //     payment.referenceType === 'CUSTOMER'
    //       ? await CustomerInvoice.findOne({
    //           _id: payment.orderId,
    //           orgId,
    //           isDeleted: false
    //         }).session(session)
    //       : await VendorInvoice.findOne({
    //           _id: payment.orderId,
    //           orgId,
    //           isDeleted: false
    //         }).session(session);

    //   if (!invoice) {
    //     throw new Error('Invoice not found');
    //   }
    // }

    /* =====================
       STEP 1: REVERT OLD PAYMENT
    ===================== */
    const oldImpact = payment.type === 'IN'
      ? -payment.amount
      : payment.amount;

    await Account.findOneAndUpdate(
      { _id: account._id },
      { $inc: { currentBalance: oldImpact } },
      { session }
    );

    if (invoice) {
      invoice.paidAmount -= payment.amount;
      invoice.dueAmount += payment.amount;
    }

    /* =====================
       STEP 2: APPLY NEW PAYMENT
    ===================== */
    const newPayableAmount = invoice
      ? Math.min(amount, invoice.dueAmount)
      : amount;

    const newImpact = payment.type === 'IN'
      ? newPayableAmount
      : -newPayableAmount;

    await Account.findOneAndUpdate(
      { _id: account._id },
      { $inc: { currentBalance: newImpact } },
      { session }
    );

    if (invoice) {
      invoice.paidAmount += newPayableAmount;
      invoice.dueAmount -= newPayableAmount;
      invoice.status =
        invoice.dueAmount === 0 ? 'PAID' : 'PARTIAL';
      await invoice.save({ session });
    }

    /* =====================
       UPDATE PAYMENT DOC
    ===================== */
    payment.amount = newPayableAmount;
    if (paymentMode) payment.paymentMode = paymentMode;
    if (paymentDate) payment.paymentDate = paymentDate;
    if (remarks !== undefined) payment.remarks = remarks;

    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Payment Update Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment'
    });
  }
};

exports.remove = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orgId = req.user.organization.orgId;
    const { id } = req.params;

    /* =====================
       FETCH PAYMENT
    ===================== */
    const payment = await Payment.findOne({
      _id: id,
      orgId,
      isDeleted: false
    }).session(session);

    if (!payment) {
      throw new Error('Payment not found');
    }

    /* =====================
       FETCH ACCOUNT
    ===================== */
    const account = await Account.findOne({
      _id: payment.accountId,
      orgId,
      isDeleted: false
    }).session(session);

    if (!account) {
      throw new Error('Account not found');
    }

    /* =====================
       FETCH INVOICE (IF ANY)
    ===================== */
    let invoice = null;

    // if (payment.orderId) {
    //   invoice =
    //     payment.referenceType === 'CUSTOMER'
    //       ? await CustomerInvoice.findOne({
    //           _id: payment.orderId,
    //           orgId,
    //           isDeleted: false
    //         }).session(session)
    //       : await VendorInvoice.findOne({
    //           _id: payment.orderId,
    //           orgId,
    //           isDeleted: false
    //         }).session(session);

    //   if (!invoice) {
    //     throw new Error('Invoice not found');
    //   }
    // }

    /* =====================
       REVERT PAYMENT EFFECT
    ===================== */
    const revertAmount = payment.type === 'IN'
      ? -payment.amount
      : payment.amount;

    await Account.findOneAndUpdate(
      { _id: account._id },
      { $inc: { currentBalance: revertAmount } },
      { session }
    );

    if (invoice) {
      invoice.paidAmount -= payment.amount;
      invoice.dueAmount += payment.amount;
      invoice.status =
        invoice.paidAmount <= 0
          ? 'UNPAID'
          : 'PARTIAL';

      await invoice.save({ session });
    }

    /* =====================
       SOFT DELETE PAYMENT
    ===================== */
    payment.isDeleted = true;
    payment.deletedBy = {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      deletedAt: new Date()
    };

    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: 'Payment deleted and reverted successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Payment Delete Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete payment'
    });
  }
};

