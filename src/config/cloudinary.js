const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─────────────────────────────────────────────
//  Memory storage — files buffered in RAM, then
//  streamed to Cloudinary via upload_stream API.
//  This avoids multer-storage-cloudinary entirely
//  and works with Cloudinary v2.
// ─────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
  cb(null, true);
};

const memoryStorage = multer.memoryStorage();

const uploadProductImages = multer({
  storage:    memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

const uploadAvatar = multer({
  storage:    memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

// ─────────────────────────────────────────────
//  Upload helpers (called from service layer)
// ─────────────────────────────────────────────

/**
 * Upload a single buffer to Cloudinary.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder
 * @returns {Promise<{url, publicId, width, height}>}
 */
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Upload an avatar buffer with face-aware square crop.
 */
function uploadAvatarToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'marketplace/avatars',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
async function deleteImage(publicId) {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
}

module.exports = {
  cloudinary,
  uploadProductImages,
  uploadAvatar,
  uploadToCloudinary,
  uploadAvatarToCloudinary,
  deleteImage,
};