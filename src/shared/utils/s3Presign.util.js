const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../../config/storage.config');

const BUCKET = process.env.AWS_BUCKET_NAME;

/**
 * Upload URL
 */
exports.getUploadUrl = async ({ orgId, fileName, contentType }) => {
  const key = `documents/${orgId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  return { url, key };
};

/**
 * Download URL
 */
exports.getDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 });
};
