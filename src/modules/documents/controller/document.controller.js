const Document = require('../model/ document.model');

exports.upload = async (req, res) => {
  const file = req.file;

  const document = await Document.create({
    fileName: file.filename,
    originalName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileSize: file.size,
    mimeType: file.mimetype,

    fileCategory: req.body.fileCategory,
    department: req.body.department,

    referenceType: req.body.referenceType,
    referenceId: req.body.referenceId,
    description: req.body.description,

    orgId: req.user.organization.orgId,

    uploadedBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: document });
};

exports.list = async (req, res) => {
  const filter = {
    orgId: req.user.organization.orgId,
    isDeleted: false
  };

  if (req.query.department) {
    filter.department = req.query.department;
  }

  if (req.query.referenceType && req.query.referenceId) {
    filter.referenceType = req.query.referenceType;
    filter.referenceId = req.query.referenceId;
  }

  const documents = await Document.find(filter)
    .sort({ createdAt: -1 });

  res.json({ success: true, data: documents });
};

exports.remove = async (req, res) => {
  await Document.findOneAndUpdate(
    { _id: req.params.id, orgId: req.user.organization.orgId },
    { isDeleted: true }
  );

  res.json({ success: true, message: 'Document deleted' });
};
