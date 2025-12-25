const mongoose = require('mongoose');

const CustomerOrderSchema = new mongoose.Schema(
  {
    // 🔹 Order Name
    name: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Customer
    customerId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Warehouse
    warehouseId: {
      type: String,
      required: true,
      index: true
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

    // 🔹 Status
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },

    // 🔹 Organization
    orgId: {
      type: String,
      required: true,
      index: true
    },

    // 🔹 Soft Delete
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
  { timestamps: true }
);

// 🔹 Auto calculate amounts
CustomerOrderSchema.pre('save', function (next) {
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
CustomerOrderSchema.index({ orgId: 1, customerId: 1 });
CustomerOrderSchema.index({ orgId: 1, status: 1 });
CustomerOrderSchema.index({ orgId: 1, orderDate: -1 });

module.exports = mongoose.model('CustomerOrder', CustomerOrderSchema);
