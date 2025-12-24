const mongoose = require('mongoose');

const VendorOrderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    // 🔹 Vendor
    vendorId: {
      type: String,
      required: true,
      index: true
    },
    warehouseId: {
      type: String,
      required: true,
      index: true
    },
    remark: {
      type: String,
    },

    // 🔹 Order Info
    orderNumber: {
      type: String,
      index: true
    },

    orderDate: {
      type: Date,
      default: Date.now
    },

    // 🔹 Items
    items: [
      {
        materialId: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        rate: {
          type: Number,
          required: true,
          min: 0
        },
        amount: {
          type: Number,
          min: 0
        }
      }
    ],

    // 🔹 Financials
    totalAmount: {
      type: Number,
      min: 0
    },

    // 🔹 Order Status
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },

    // 🔹 Organization
    orgId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    // 🔹 Audit
    createdBy: {
      userId: String,
      name: String,
      email: String
    },

    deletedBy: {
      userId: String,
      name: String,
      email: String,
      deletedAt: Date
    }
  },
  {
    timestamps: true
  }
);

// 🔹 Auto-calculate item amount & total
VendorOrderSchema.pre('save', function (next) {
  let total = 0;

  this.items = this.items.map(item => {
    const amount = item.quantity * item.rate;
    total += amount;
    return { ...item, amount };
  });

  this.totalAmount = total;
  next();
});

// 🔹 Indexes
VendorOrderSchema.index({ orgId: 1, vendorId: 1 });
VendorOrderSchema.index({ orgId: 1, status: 1 });
VendorOrderSchema.index({ orgId: 1, orderDate: -1 });

module.exports = mongoose.model('VendorOrder', VendorOrderSchema);
