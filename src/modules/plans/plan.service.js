const Plan = require('./plan.model');

/**
 * CREATE PLAN
 */
exports.create = async (payload, user) => {
  const exists = await Plan.findOne({
    name: payload.name,
    isDeleted: { $ne: true }
  });
  if (exists) throw new Error('Plan code already exists');

  return Plan.create({
    ...payload,
    createdBy: {
      userId: user.userId,
      email: user.email
    }
  });
};

/**
 * LIST PLANS
 */
exports.list = async ({ search = '' }) => {
  const query = { isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  return Plan.find(query).sort({ createdAt: -1 }).lean();
};

/**
 * GET PLAN BY ID
 */
exports.getById = async (id) => {
  const plan = await Plan.findOne({
    _id: id,
    isDeleted: { $ne: true }
  }).lean();

  if (!plan) throw new Error('Plan not found');
  return plan;
};

/**
 * UPDATE PLAN (NO HARD DELETE, SAFE FIELDS)
 */
exports.update = async (id, payload) => {
  const allowedFields = [
    'name',
    'price',
    'durationInDays',
    'features',
    'status'
  ];

  const updateData = {};
  allowedFields.forEach(f => {
    if (payload[f] !== undefined) updateData[f] = payload[f];
  });

  const plan = await Plan.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $set: updateData },
    { new: true }
  );

  if (!plan) throw new Error('Plan not found or deleted');
  return plan;
};

/**
 * DELETE PLAN (SOFT DELETE)
 */
exports.remove = async (id, user) => {
  const plan = await Plan.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    {
      isDeleted: true,
      deletedBy: {
        userId: user.userId,
        email: user.email
      }
    },
    { new: true }
  );

  if (!plan) throw new Error('Plan not found or already deleted');
  return true;
};
