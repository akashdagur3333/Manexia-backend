const VendorOrder = require('../model/vendorOrder.model');
const MaterialStock = require('../../row-material/models/materialStock.model');
const MaterialStockUsage = require('../../row-material/models/materialStockUsage.model');

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const {
      name,
      vendorId,
      warehouseId,
      items,
      orderDate,
      remark
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // 🔹 Basic validation
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor is required'
      });
    }

    if (!warehouseId) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse is required'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // 🔹 Validate & calculate items
    let totalAmount = 0;

    const validatedItems = items.map(item => {
      if (
        !item.materialId ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0 ||
        typeof item.rate !== 'number' ||
        item.rate <= 0
      ) {
        throw new Error('Invalid item data');
      }

      const amount = item.quantity * item.rate;
      totalAmount += amount;

      return {
        materialId: item.materialId,
        quantity: item.quantity,
        rate: item.rate,
        amount
      };
    });

    // 🔹 Generate order number
    const orderNumber = `PO-${Date.now()}`;

    const order = await VendorOrder.create({
      name,
      vendorId,
      warehouseId,
      items: validatedItems,
      totalAmount,
      remark: remark?.trim(),
      orderNumber,
      orderDate: orderDate || new Date(),
      status: 'PENDING',
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.json({
      success: true,
      message: 'Vendor order created successfully',
      data: order
    });

  } catch (error) {
    console.error('VendorOrder Create Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create vendor order'
    });
  }
};


exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const orders = await VendorOrder.aggregate([
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
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'vendor'
        }
      },
      { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },

      /* =====================
         WAREHOUSE LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'warehouses',
          let: {
            wid: {
              $cond: [
                { $regexMatch: { input: '$warehouseId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$warehouseId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$wid'] },
                isDeleted: false
              }
            },
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'warehouse'
        }
      },
      { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },

      /* =====================
         MATERIAL LOOKUP (FOR ITEMS)
      ===================== */
      {
        $lookup: {
          from: 'materials',
          let: {
            materialIds: {
              $map: {
                input: '$items',
                as: 'item',
                in: {
                  $cond: [
                    { $regexMatch: { input: '$$item.materialId', regex: /^[a-f\d]{24}$/i } },
                    { $toObjectId: '$$item.materialId' },
                    null
                  ]
                }
              }
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$materialIds'] },
                isDeleted: false
              }
            },
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'materials'
        }
      },

      /* =====================
         MERGE MATERIAL NAME INTO ITEMS
      ===================== */
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    materialName: {
                      $let: {
                        vars: {
                          mat: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$materials',
                                  as: 'm',
                                  cond: {
                                    $eq: [
                                      '$$m._id',
                                      {
                                        $cond: [
                                          { $regexMatch: { input: '$$item.materialId', regex: /^[a-f\d]{24}$/i } },
                                          { $toObjectId: '$$item.materialId' },
                                          null
                                        ]
                                      }
                                    ]
                                  }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: '$$mat.name'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },

      /* =====================
         FINAL RESPONSE
      ===================== */
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          orderDate: 1,
          name:1,
          vendorId: '$vendor._id',
          vendorName: '$vendor.name',

          warehouseId: '$warehouse._id',
          warehouseName: '$warehouse.name',

          items: 1,
          totalAmount: 1,
          status: 1,

          createdAt: 1,
          updatedAt: 1,
          createdBy: 1
        }
      },

      { $sort: { createdAt: -1 } }
    ]);

    return res.json({ success: true, data: orders });

  } catch (error) {
    console.error('VendorOrder List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor orders',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const {
      name,
      vendorId,
      warehouseId,
      orderDate,
      items,
      remark
    } = req.body;

    // ❌ Status must NOT be updated here
    if (req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Status cannot be updated from this API'
      });
    }

    // 🔹 Validate & recalculate items if provided
    let updatedItems;
    let totalAmount = 0;

    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order items are required'
        });
      }

      updatedItems = items.map(item => {
        if (
          !item.materialId ||
          typeof item.quantity !== 'number' ||
          item.quantity <= 0 ||
          typeof item.rate !== 'number' ||
          item.rate <= 0
        ) {
          throw new Error('Invalid item data');
        }

        const amount = item.quantity * item.rate;
        totalAmount += amount;

        return {
          materialId: item.materialId,
          quantity: item.quantity,
          rate: item.rate,
          amount
        };
      });
    }

    const updateData = {
      ...(name && { name }),
      ...(vendorId && { vendorId }),
      ...(warehouseId && { warehouseId }),
      ...(orderDate && { orderDate }),
      ...(remark && { remark: remark.trim() }),
      ...(updatedItems && { items: updatedItems }),
      ...(updatedItems && { totalAmount })
    };

    const order = await VendorOrder.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: { $ne: true },
        status: { $nin: ['RECEIVED', 'CANCELLED'] }
      },
      { $set: updateData },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be updated'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('VendorOrder Update Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update vendor order'
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const order = await VendorOrder.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false,
        status: { $ne: 'RECEIVED' }
      },
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be deleted'
      });
    }

    return res.json({
      success: true,
      message: 'Vendor order deleted successfully'
    });

  } catch (error) {
    console.error('VendorOrder Delete Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete vendor order',
      error: error.message
    });
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const order = await VendorOrder.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false,
        status: 'PENDING'
      },
      {
        status: 'APPROVED'
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be approved'
      });
    }

    res.json({
      success: true,
      message: 'Order approved successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.receive = async (req, res) => {
  const session = await VendorOrder.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    /* =====================
       1️⃣ Lock & Fetch APPROVED Order
    ===================== */
    const order = await VendorOrder.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: false,
        status: 'APPROVED'
      },
      {
        $set: { status: 'RECEIVING' } // temporary lock to avoid double receive
      },
      { new: true, session }
    );

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order must be approved before receiving'
      });
    }

    /* =====================
       2️⃣ Stock IN for each item
    ===================== */
    for (const item of order.items) {
      // 🔹 Update MaterialStock (material + warehouse)
      await MaterialStock.findOneAndUpdate(
        {
          materialId: item.materialId,
          warehouseId: order.warehouseId,
          orgId
        },
        {
          $inc: { availableQty: item.quantity },
          $set: {
            referenceType: 'VENDOR_ORDER'
          },
          $setOnInsert: {
            reservedQty: 0,
            orgId,
            materialId: item.materialId,
            warehouseId: order.warehouseId
          }
        },
        { upsert: true, session }
      );

      // 🔹 Create MaterialStockUsage (AUDIT with REMARK)
      await MaterialStockUsage.create(
        [
          {
            materialId: item.materialId,
            warehouseId: order.warehouseId,
            quantity: item.quantity,
            type: 'IN',
            referenceType: 'VENDOR_ORDER',
            referenceId: order._id.toString(),
            remark: order.remark || 'Vendor order received',
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
    }

    /* =====================
       3️⃣ Finalize Order
    ===================== */
    order.status = 'RECEIVED';
    await order.save({ session });

    /* =====================
       4️⃣ Commit Transaction
    ===================== */
    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: 'Order received successfully and stock updated',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Receive Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to receive order',
      error: error.message
    });
  }
};


