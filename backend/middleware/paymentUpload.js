const multer = require('multer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '../uploads/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const { randomUUID } = require('crypto');
const useCloudinary = Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, screenshotsDir);
      },
      filename: function (req, file, cb) {
        const uniqueName = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, uniqueName);
      }
    });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed for payment screenshots.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
