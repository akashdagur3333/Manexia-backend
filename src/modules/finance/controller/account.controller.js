const Account = require('../model/account.model');
const mongoose = require('mongoose')
exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const {
      name,
      type,
      accountNumber,
      openingBalance
    } = req.body;

    /* =====================
       VALIDATIONS
    ===================== */
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Account name is required'
      });
    }

    if (!type || !['CASH', 'BANK'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type'
      });
    }

    if (openingBalance !== undefined && openingBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Opening balance cannot be negative'
      });
    }

    /* =====================
       DUPLICATE CHECK
    ===================== */
    const existingAccount = await Account.findOne({
      orgId,
      name: name.trim(),
      isDeleted: false
    });

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: 'Account with same name already exists'
      });
    }

    /* =====================
       CREATE ACCOUNT
    ===================== */
    const account = await Account.create({
      name: name.trim(),
      type,
      accountNumber: accountNumber,
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0, // 🔒 sync on create
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account
    });

  } catch (error) {
    console.error('Account Create Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
};


exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const { search = '', type } = req.query;

    const match = {
      orgId,
      isDeleted: false
    };

    /* =====================
       SEARCH (NAME / ACCOUNT NO)
    ===================== */
    if (search && search.trim() !== '') {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } }
      ];
    }

    /* =====================
       FILTER BY TYPE
    ===================== */
    if (type && ['CASH', 'BANK'].includes(type)) {
      match.type = type;
    }

    const accounts = await Account.find(match)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('Account List Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    });
  }
};
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    /* =====================
       VALIDATE ID
    ===================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account id'
      });
    }

    /* =====================
       PREVENT DELETE IF BALANCE EXISTS
    ===================== */
    const account = await Account.findOne({
      _id: id,
      orgId,
      isDeleted: false
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.currentBalance !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Account with balance cannot be deleted'
      });
    }

    /* =====================
       SOFT DELETE
    ===================== */
    await Account.findOneAndUpdate(
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
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account Delete Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const {
      name,
      type,
      accountNumber
      // ❌ openingBalance & currentBalance MUST NOT be updated here
    } = req.body;

    /* =====================
       VALIDATE ID
    ===================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account id'
      });
    }

    /* =====================
       FETCH ACCOUNT
    ===================== */
    const account = await Account.findOne({
      _id: id,
      orgId,
      isDeleted: false
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    /* =====================
       VALIDATIONS
    ===================== */
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Account name cannot be empty'
      });
    }

    if (type && !['CASH', 'BANK'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type'
      });
    }

    /* =====================
       DUPLICATE NAME CHECK
    ===================== */
    if (name && name.trim() !== account.name) {
      const duplicate = await Account.findOne({
        _id: { $ne: id },
        orgId,
        name: name.trim(),
        isDeleted: false
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Another account with same name already exists'
        });
      }
    }

    /* =====================
       ALLOWED UPDATES ONLY
    ===================== */
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const updatedAccount = await Account.findOneAndUpdate(
      { _id: id, orgId },
      { $set: updateData },
      { new: true }
    );

    return res.json({
      success: true,
      message: 'Account updated successfully',
      data: updatedAccount
    });

  } catch (error) {
    console.error('Account Update Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update account'
    });
  }
};
