const cloudinary = require('cloudinary').v2;

const cloudinaryConfigured = Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadImageToCloudinary = async (fileBuffer, options = {}) => {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: options.folder || 'hostel-fee-manager',
        public_id: options.public_id,
        overwrite: false,
        transformation: options.transformation || []
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadImageToCloudinary,
  cloudinaryConfigured,
};
