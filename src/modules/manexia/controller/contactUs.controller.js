const ContactUs = require('../model/contactUs.mode');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
    try {
      const { name, email, phoneNumber, subject, message } = req.body;
  
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, subject and message are required'
        });
      }
  
      const contact = await ContactUs.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber?.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'NEW'
      });
  
      return res.status(201).json({
        success: true,
        message: 'Message submitted successfully',
        data: contact
      });
  
    } catch (error) {
      console.error('ContactUs Create Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit message'
      });
    }
  };

  exports.list = async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
  
      const match = { isDeleted: false };
  
      if (status && ['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
        match.status = status;
      }
  
      if (search) {
        match.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } }
        ];
      }
  
      const skip = (Number(page) - 1) * Number(limit);
  
      const [data, total] = await Promise.all([
        ContactUs.find(match)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        ContactUs.countDocuments(match)
      ]);
  
      return res.json({
        success: true,
        data,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
  
    } catch (error) {
      console.error('ContactUs List Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch contact messages'
      });
    }
  };

  exports.getById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid id'
        });
      }
  
      const contact = await ContactUs.findOne({
        _id: id,
        isDeleted: false
      });
  
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }
  
      return res.json({
        success: true,
        data: contact
      });
  
    } catch (error) {
      console.error('ContactUs Get Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch message'
      });
    }
  };
  
  exports.update = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid id'
        });
      }
  
      if (!['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
  
      const updated = await ContactUs.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { status },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }
  
      return res.json({
        success: true,
        message: 'Status updated successfully',
        data: updated
      });
  
    } catch (error) {
      console.error('ContactUs Update Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update message'
      });
    }
  };

  exports.remove = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid id'
        });
      }
  
      const deleted = await ContactUs.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
  
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }
  
      return res.json({
        success: true,
        message: 'Message deleted successfully'
      });
  
    } catch (error) {
      console.error('ContactUs Delete Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete message'
      });
    }
  };
  