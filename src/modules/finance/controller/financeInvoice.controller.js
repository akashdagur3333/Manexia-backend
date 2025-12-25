const FinanceInvoice = require('../model/financeInvoice.model');
const mongoose = require('mongoose');
const {
  getNextInvoiceNumber,
  formatInvoiceNumber
} = require('../../../shared/helper/helper');

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      referenceType,   // CUSTOMER | VENDOR
      referenceId,
      orderId,
      amount,
      taxAmount = 0
    } = req.body;

    /* =====================
       VALIDATIONS
    ===================== */
    if (!referenceType || !['CUSTOMER', 'VENDOR'].includes(referenceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference type'
      });
    }

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Reference id is required'
      });
    }

    if (amount === undefined || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice amount must be valid'
      });
    }

    if (taxAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Tax amount cannot be negative'
      });
    }

    /* =====================
       AUTO GENERATE INVOICE NUMBER
       (STARTS FROM 1)
    ===================== */
    const seq = await getNextInvoiceNumber(orgId);
    const invoiceNumber = formatInvoiceNumber(seq); // e.g. INV-0001

    /* =====================
       CALCULATIONS
    ===================== */
    const totalAmount = amount + taxAmount;

    /* =====================
       CREATE INVOICE
    ===================== */
    const invoice = await FinanceInvoice.create({
      referenceType,
      referenceId,
      orderId,

      invoiceNumber,
      invoiceDate: new Date(),

      amount,
      taxAmount,
      totalAmount,

      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: 'UNPAID',

      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });

  } catch (error) {
    console.error('FinanceInvoice Create Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      page = 1,
      limit = 20,
      referenceType,      // CUSTOMER | VENDOR
      paymentStatus,      // UNPAID | PARTIAL | PAID
      search,             // invoiceNumber
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

    if (referenceType && ['CUSTOMER', 'VENDOR'].includes(referenceType)) {
      match.referenceType = referenceType;
    }

    if (paymentStatus && ['UNPAID', 'PARTIAL', 'PAID'].includes(paymentStatus)) {
      match.paymentStatus = paymentStatus;
    }

    if (search && search.trim() !== '') {
      match.invoiceNumber = { $regex: search, $options: 'i' };
    }

    if (fromDate && toDate) {
      match.invoiceDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    /* =====================
       FETCH DATA + COUNT
    ===================== */
    const [invoices, total] = await Promise.all([
      FinanceInvoice.find(match)
        .sort({ invoiceDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      FinanceInvoice.countDocuments(match)
    ]);

    return res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('FinanceInvoice List Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const { id } = req.params;

    const {
      amount,
      taxAmount
    } = req.body;

    /* =====================
       VALIDATE ID
    ===================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice id'
      });
    }

    /* =====================
       FETCH INVOICE
    ===================== */
    const invoice = await FinanceInvoice.findOne({
      _id: id,
      orgId,
      isDeleted: false
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    /* =====================
       BLOCK UPDATE IF PAID / PARTIAL
    ===================== */
    if (invoice.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice with payments cannot be updated'
      });
    }

    /* =====================
       VALIDATIONS
    ===================== */
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative'
      });
    }

    if (taxAmount !== undefined && taxAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Tax amount cannot be negative'
      });
    }

    /* =====================
       RECALCULATE TOTALS
       (INVOICE IS UNPAID)
    ===================== */
    const updatedAmount =
      amount !== undefined ? amount : invoice.amount;

    const updatedTax =
      taxAmount !== undefined ? taxAmount : invoice.taxAmount;

    const totalAmount = updatedAmount + updatedTax;

    /* =====================
       UPDATE INVOICE
    ===================== */
    const updatedInvoice = await FinanceInvoice.findOneAndUpdate(
      { _id: id, orgId },
      {
        $set: {
          amount: updatedAmount,
          taxAmount: updatedTax,
          totalAmount,
          dueAmount: totalAmount // unpaid invoice
        }
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });

  } catch (error) {
    console.error('FinanceInvoice Update Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update invoice'
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const { id } = req.params;

    /* =====================
       VALIDATE ID
    ===================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice id'
      });
    }

    /* =====================
       FETCH INVOICE
    ===================== */
    const invoice = await FinanceInvoice.findOne({
      _id: id,
      orgId,
      isDeleted: false
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    /* =====================
       BLOCK DELETE IF PAID / PARTIAL
    ===================== */
    if (invoice.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice with payments cannot be deleted'
      });
    }

    /* =====================
       SOFT DELETE
    ===================== */
    await FinanceInvoice.findOneAndUpdate(
      { _id: id, orgId },
      {
        isDeleted: true,
        deletedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('FinanceInvoice Delete Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete invoice'
    });
  }
};


