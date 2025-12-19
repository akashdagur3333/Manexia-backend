const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../../config/storage.config');

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (req, file, cb) => {
      const fileName = `documents/${req.user.orgId}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
