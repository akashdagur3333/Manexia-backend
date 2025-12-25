const CustomerOrder = require('../model/customerOrder.model');
const mongoose = require('mongoose');
const MaterialStock = require('../../row-material/models/materialStock.model');
const MaterialStockUsage = require('../../row-material/models/materialStockUsage.model');

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const {
      name,
      customerId,
      warehouseId,
      items,
      orderDate,
      remark
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    if (!warehouseId) {
      return res.status(400).json({ success: false, message: 'Warehouse is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

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

    const orderNumber = `SO-${Date.now()}`;

    const order = await CustomerOrder.create({
      name,
      customerId,
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
      message: 'Customer order created successfully',
      data: order
    });

  } catch (error) {
    console.error('CustomerOrder Create Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create customer order'
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const orders = await CustomerOrder.aggregate([
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
         CUSTOMER LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'customers',
          let: {
            cid: {
              $cond: [
                { $regexMatch: { input: '$customerId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$customerId' },
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
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

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
         CLEANUP
      ===================== */
      {
        $project: {
          materials: 0
        }
      },

      /* =====================
         SORT
      ===================== */
      { $sort: { createdAt: -1 } },

      /* =====================
         FINAL RESPONSE
      ===================== */
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          orderDate: 1,
          name: 1,

          customerId: '$customer._id',
          customerName: '$customer.name',

          warehouseId: '$warehouse._id',
          warehouseName: '$warehouse.name',

          items: 1,
          totalAmount: 1,
          status: 1,

          createdAt: 1,
          createdBy: 1
        }
      }
    ]);

    return res.json({ success: true, data: orders });

  } catch (error) {
    console.error('CustomerOrder List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message
    });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization.orgId;

    if (req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Status cannot be updated from this API'
      });
    }

    let updatedItems;
    let totalAmount = 0;

    if (req.body.items) {
      updatedItems = req.body.items.map(item => {
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

        return { ...item, amount };
      });
    }

    const updateData = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.customerId && { customerId: req.body.customerId }),
      ...(req.body.warehouseId && { warehouseId: req.body.warehouseId }),
      ...(req.body.orderDate && { orderDate: req.body.orderDate }),
      ...(req.body.remark && { remark: req.body.remark.trim() }),
      ...(updatedItems && { items: updatedItems, totalAmount })
    };

    const order = await CustomerOrder.findOneAndUpdate(
      {
        _id: id,
        orgId,
        isDeleted: { $ne: true },
        status: { $nin: ['DELIVERED', 'CANCELLED'] }
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

    res.json({
      success: true,
      message: 'Customer order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('CustomerOrder Update Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const order = await CustomerOrder.findOneAndUpdate(
      {
        _id: req.params.id,
        orgId,
        isDeleted: false,
        status: { $ne: 'DELIVERED' }
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

    res.json({
      success: true,
      message: 'Customer order deleted successfully'
    });

  } catch (error) {
    console.error('CustomerOrder Delete Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete customer order'
    });
  }
};

exports.confirm = async (req, res) => {
  const order = await CustomerOrder.findOneAndUpdate(
    {
      _id: req.params.id,
      orgId: req.user.organization.orgId,
      isDeleted: false,
      status: 'PENDING'
    },
    { status: 'CONFIRMED' },
    { new: true }
  );

  if (!order) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be confirmed'
    });
  }

  res.json({ success: true, message: 'Order confirmed', data: order });
};

exports.deliver = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orgId = req.user.organization.orgId;

    const order = await CustomerOrder.findOneAndUpdate(
      {
        _id: req.params.id,
        orgId,
        isDeleted: false,
        status: 'CONFIRMED'
      },
      { status: 'DELIVERING' },
      { new: true, session }
    );

    if (!order) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Order must be confirmed before delivery'
      });
    }

    for (const item of order.items) {
      const stock = await MaterialStock.findOne({
        materialId: item.materialId,
        warehouseId: order.warehouseId,
        orgId
      }).session(session);

      if (!stock || stock.availableQty < item.quantity) {
        throw new Error('Insufficient stock for delivery');
      }

      await MaterialStock.findOneAndUpdate(
        {
          materialId: item.materialId,
          warehouseId: order.warehouseId,
          orgId
        },
        {
          $inc: { availableQty: -item.quantity },
          $set: { referenceType: 'CUSTOMER_ORDER' },
          $setOnInsert: {
            reservedQty: 0,
            orgId,
            materialId: item.materialId,
            warehouseId: order.warehouseId
          }
        },
        { upsert: true, session }
      );

      await MaterialStockUsage.create(
        [{
          materialId: item.materialId,
          warehouseId: order.warehouseId,
          quantity: item.quantity,
          type: 'OUT',
          referenceType: 'CUSTOMER_ORDER',
          remark:'Customer order delivered',
          orgId,
          createdBy: req.user
        }],
        { session }
      );
    }

    order.status = 'DELIVERED';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Order delivered successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('CustomerOrder Deliver Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

