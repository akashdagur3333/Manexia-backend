const WarehouseOrder = require('../model/warehouseOrder.model');
const MaterialStock =require('../../row-material/models/materialStock.model')
exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const {
      fromWarehouseId,
      toWarehouseId,
      orderDate,
      items
    } = req.body;

    // 🔐 Basic validations
    if (!fromWarehouseId) {
      return res.status(400).json({
        success: false,
        message: 'From warehouse is required'
      });
    }

    if (!toWarehouseId) {
      return res.status(400).json({
        success: false,
        message: 'To warehouse is required'
      });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res.status(400).json({
        success: false,
        message: 'From and To warehouse cannot be same'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // 🔍 Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].materialId || !items[i].quantity || items[i].quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have materialId and quantity > 0'
        });
      }
    }

    // 🔢 Generate order number
    const orderNumber = `WO-${Date.now()}`;

    // ✅ Create warehouse order
    const order = await WarehouseOrder.create({
      fromWarehouseId,
      toWarehouseId,

      orderNumber,
      orderDate: orderDate || new Date(),

      items,

      status: 'PENDING',

      orgId,

      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Warehouse order created successfully',
      data: order
    });

  } catch (error) {
    console.error('WarehouseOrder Create Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create warehouse order',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { orgId } },

      /* =======================
         FROM WAREHOUSE
      ======================= */
      {
        $lookup: {
          from: 'warehouses',
          let: { wid: { $toObjectId: '$fromWarehouseId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$wid'] },
                isDeleted: false
              }
            },
            { $project: { _id: 1, name: 1 } }   // ✅ keep _id
          ],
          as: 'fromWarehouse'
        }
      },
      { $unwind: { path: '$fromWarehouse', preserveNullAndEmptyArrays: true } },

      /* =======================
         TO WAREHOUSE
      ======================= */
      {
        $lookup: {
          from: 'warehouses',
          let: { wid: { $toObjectId: '$toWarehouseId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$wid'] },
                isDeleted: false
              }
            },
            { $project: { _id: 1, name: 1 } }   // ✅ keep _id
          ],
          as: 'toWarehouse'
        }
      },
      { $unwind: { path: '$toWarehouse', preserveNullAndEmptyArrays: true } },

      /* =======================
         MATERIALS
      ======================= */
      {
        $lookup: {
          from: 'materials',
          let: {
            materialIds: {
              $map: {
                input: '$items',
                as: 'i',
                in: { $toObjectId: '$$i.materialId' }
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
            { $project: { _id: 1, name: 1 } }  // ✅ keep _id
          ],
          as: 'materials'
        }
      },

      /* =======================
         MAP MATERIAL NAME + ID INTO ITEMS
      ======================= */
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                materialId: '$$item.materialId',
                quantity: '$$item.quantity',
                materialName: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$materials',
                            as: 'm',
                            cond: {
                              $eq: ['$$m._id', { $toObjectId: '$$item.materialId' }]
                            }
                          }
                        },
                        as: 'fm',
                        in: '$$fm.name'
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      },

      /* =======================
         FINAL PROJECTION
      ======================= */
      {
        $project: {
          orderNumber: 1,
          orderDate: 1,
          status: 1,
          createdAt: 1,

          fromWarehouseId: '$fromWarehouse._id',
          fromWarehouseName: '$fromWarehouse.name',

          toWarehouseId: '$toWarehouse._id',
          toWarehouseName: '$toWarehouse.name',

          items: 1
        }
      },

      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [orders, total] = await Promise.all([
      WarehouseOrder.aggregate(pipeline),
      WarehouseOrder.countDocuments({ orgId })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('WarehouseOrder List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse orders',
      error: error.message
    });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    const {
      fromWarehouseId,
      toWarehouseId,
      orderDate,
      items
    } = req.body;

    // 🔐 Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order id is required'
      });
    }

    // 🔍 Find existing order
    const existingOrder = await WarehouseOrder.findOne({
      _id: id,
      orgId,
      status: 'PENDING'
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be updated'
      });
    }

    // 🔐 Validations
    if (fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId) {
      return res.status(400).json({
        success: false,
        message: 'From and To warehouse cannot be same'
      });
    }

    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one item is required'
        });
      }

      for (let i = 0; i < items.length; i++) {
        if (!items[i].materialId || !items[i].quantity || items[i].quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each item must have materialId and quantity > 0'
          });
        }
      }
    }

    // 🧱 Prepare update object
    const updateData = {};

    if (fromWarehouseId) updateData.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) updateData.toWarehouseId = toWarehouseId;
    if (orderDate) updateData.orderDate = orderDate;
    if (items) updateData.items = items;

    // 🔄 Update order
    const updatedOrder = await WarehouseOrder.findOneAndUpdate(
      { _id: id, orgId, status: 'PENDING' },
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Warehouse order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('WarehouseOrder Update Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update warehouse order',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order id is required'
      });
    }

    const order = await WarehouseOrder.findOneAndUpdate(
      {
        _id: id,
        orgId,
        status: 'PENDING'
      },
      {
        status: 'CANCELLED'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Warehouse order cancelled successfully'
    });

  } catch (error) {
    console.error('WarehouseOrder Delete Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to cancel warehouse order',
      error: error.message
    });
  }
};



exports.approve = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    // 🔍 Fetch order
    const order = await WarehouseOrder.findOne({
      _id: id,
      orgId,
      status: 'PENDING'
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    // 🔁 Reserve stock for each item
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];

      const stock = await MaterialStock.findOne({
        materialId: item.materialId,
        warehouseId: order.fromWarehouseId,
        orgId,
        isDeleted: false
      }).session(session);

      if (!stock || stock.availableQty < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for material ${item.materialId}`
        });
      }

      await MaterialStock.updateOne(
        { _id: stock._id },
        {
          $inc: {
            availableQty: -item.quantity,
            reservedQty: item.quantity
          }
        },
        { session }
      );
    }

    // ✅ Update order status
    order.status = 'APPROVED';
    await order.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Order approved and stock reserved'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Approve Order Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to approve order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

