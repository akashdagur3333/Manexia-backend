const Document = require('./document.model');
const {
  getUploadUrl,
  getDownloadUrl
} = require('../../shared/utils/s3Presign.util');

/**
 * 🔼 GET PRESIGNED UPLOAD URL + SAVE METADATA
 */
exports.upload = async (req, res) => {
  try {
    const { fileName, contentType, fileSize, customName } = req.body;

    const { url, key } = await getUploadUrl({
      orgId: req.user.organization.orgId,
      fileName,
      contentType
    });
    const document = await Document.create({
      organization: req.user.organization.orgId,
      customName: customName || fileName,
      originalName: fileName,
      fileSize,
      mimeType: contentType,
      fileKey: key,
      uploadedBy: {userId:req.user.userId,name:req.user.name,email:req.user.email}
    });

    res.json({
      success: true,
      uploadUrl: url,
      documentId: document._id
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Upload failed' });
  }
};

/**
 * 📄 LIST + SEARCH DOCUMENTS
 */
exports.list = async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;

  const query = {
    organization: req.user.orgId,
    isDeleted: false,
    ...(search && {
      $or: [
        { customName: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ]
    })
  };

  const data = await Document.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Document.countDocuments(query);

  res.json({ success: true, data, total });
};

/**
 * 👁️ VIEW / DOWNLOAD DOCUMENT
 */
exports.view = async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    organization: req.user.orgId,
    isDeleted: false
  });

  if (!doc) return res.status(404).json({ message: 'Document not found' });

  const downloadUrl = await getDownloadUrl(doc.fileKey);
  res.json({ success: true, downloadUrl });
};

/**
 * ✏️ EDIT DOCUMENT (RENAME)
 */
exports.update = async (req, res) => {
  const doc = await Document.findOneAndUpdate(
    {
      _id: req.params.id,
      organization: req.user.orgId,
      isDeleted: false
    },
    {
      customName: req.body.customName,
      updatedBy: req.user.id
    },
    { new: true }
  );

  if (!doc) return res.status(404).json({ message: 'Document not found' });

  res.json({ success: true, data: doc });
};

/**
 * 🗑️ DELETE DOCUMENT (SOFT DELETE)
 */
exports.remove = async (req, res) => {
  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, organization: req.user.orgId },
    { isDeleted: true, deletedAt: new Date(), updatedBy: req.user.id },
    { new: true }
  );

  if (!doc) return res.status(404).json({ message: 'Document not found' });

  res.json({ success: true, message: 'Document deleted' });
};
