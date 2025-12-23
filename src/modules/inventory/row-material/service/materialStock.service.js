const MaterialStock = require('../models/materialStock.model');

exports.stockIn = async ({ materialId, warehouseId, qty,referenceType, orgId, user }) => {
  return MaterialStock.findOneAndUpdate(
    { materialId, warehouseId, orgId,referenceType, isDeleted: false },
    {
      $inc: { availableQty: qty },
      $setOnInsert: {
        createdBy: {
          userId: user.userId,
          name: user.name,
          email: user.email
        }
      }
    },
    { upsert: true, new: true }
  );
};

exports.reserve = async ({ materialId, warehouseId, qty, orgId }) => {
  const stock = await MaterialStock.findOne({
    materialId,
    warehouseId,
    orgId,
    isDeleted: false
  });

  if (!stock || stock.availableQty < qty) {
    throw new Error('Insufficient available stock');
  }

  return MaterialStock.updateOne(
    { _id: stock._id },
    {
      $inc: {
        availableQty: -qty,
        reservedQty: qty
      }
    }
  );
};

exports.release = async ({ materialId, warehouseId, qty, orgId }) => {
  const stock = await MaterialStock.findOne({
    materialId,
    warehouseId,
    orgId,
    isDeleted: false
  });

  if (!stock || stock.reservedQty < qty) {
    throw new Error('Insufficient reserved stock');
  }

  return MaterialStock.updateOne(
    { _id: stock._id },
    {
      $inc: {
        availableQty: qty,
        reservedQty: -qty
      }
    }
  );
};

exports.consume = async ({ materialId, warehouseId, qty, orgId }) => {
  const stock = await MaterialStock.findOne({
    materialId,
    warehouseId,
    orgId,
    isDeleted: false
  });

  if (!stock || stock.reservedQty < qty) {
    throw new Error('Insufficient reserved stock to consume');
  }

  return MaterialStock.updateOne(
    { _id: stock._id },
    {
      $inc: {
        reservedQty: -qty
      }
    }
  );
};
