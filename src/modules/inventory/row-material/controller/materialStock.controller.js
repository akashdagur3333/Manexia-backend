const MaterialStock = require('../models/materialStock.model');

exports.addOrUpdate = async (req, res) => {
  const { materialId, warehouseId, qty } = req.body;

  const stock = await MaterialStock.findOneAndUpdate(
    {
      materialId,
      warehouseId,
      orgId: req.user.organization.orgId
    },
    {
      $inc: { availableQty: qty },
      $setOnInsert: {
        createdBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email
        }
      }
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: stock });
};

exports.list = async (req, res) => {
  const stocks = await MaterialStock.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: stocks });
};
