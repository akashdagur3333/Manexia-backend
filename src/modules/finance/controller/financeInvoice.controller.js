const FinanceInvoice = require('../model/financeInvoice.model');
const mongoose = require('mongoose');


exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      referenceType,   // CUSTOMER | VENDOR
      referenceId,
      orderId,
      invoiceNumber,
      invoiceDate,
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

    if (!invoiceNumber || invoiceNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invoice number is required'
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
       DUPLICATE CHECK
    ===================== */
    const existingInvoice = await FinanceInvoice.findOne({
      orgId,
      invoiceNumber: invoiceNumber.trim(),
      isDeleted: false
    });

    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message: 'Invoice number already exists'
      });
    }

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
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: invoiceDate || new Date(),

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
      invoiceNumber,
      invoiceDate,
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
       BLOCK UPDATE IF PAID
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
       DUPLICATE INVOICE NUMBER
    ===================== */
    if (invoiceNumber && invoiceNumber !== invoice.invoiceNumber) {
      const exists = await FinanceInvoice.findOne({
        _id: { $ne: id },
        orgId,
        invoiceNumber,
        isDeleted: false
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Invoice number already exists'
        });
      }
    }

    /* =====================
       UPDATE DATA
    ===================== */
    const updatedAmount = amount ?? invoice.amount;
    const updatedTax = taxAmount ?? invoice.taxAmount;
    const totalAmount = updatedAmount + updatedTax;

    const updateData = {
      ...(invoiceNumber && { invoiceNumber }),
      ...(invoiceDate && { invoiceDate }),
      ...(amount !== undefined && { amount: updatedAmount }),
      ...(taxAmount !== undefined && { taxAmount: updatedTax }),
      totalAmount,
      dueAmount: totalAmount // since unpaid
    };

    const updatedInvoice = await FinanceInvoice.findOneAndUpdate(
      { _id: id, orgId },
      { $set: updateData },
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
       BLOCK DELETE IF PAID
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
      }
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


