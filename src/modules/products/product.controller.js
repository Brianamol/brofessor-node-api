const service = require('./product.service');
const { sendSuccess, sendCreated, paginationMeta } = require('../../utils/response');
const { ROLES } = require('../../middleware/role.middleware');

const getAll = async (req, res, next) => {
  try {
    // Non-admins can only see ACTIVE products
    if (!req.user?.roles?.includes(ROLES.ADMIN)) {
      req.query.status = 'ACTIVE';
    }
    const { page = 1, limit = 20 } = req.query;
    const { items, total } = await service.getAll(req.query);
    sendSuccess(res, items, 200, paginationMeta({ page, limit, total }));
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const data = await service.getOne(req.params.id, req.user?.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getRelated = async (req, res, next) => {
  try {
    const data = await service.getRelated(req.params.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body, req.user.id);
    sendCreated(res, data);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body, req.user.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes(ROLES.ADMIN);
    await service.remove(req.params.id, req.user.id, isAdmin);
    sendSuccess(res, { message: 'Product deleted' });
  } catch (err) { next(err); }
};

const uploadImages = async (req, res, next) => {
  try {
    const data = await service.addImages(req.params.productId, req.files, req.user.id);
    sendCreated(res, data);
  } catch (err) { next(err); }
};

const deleteImage = async (req, res, next) => {
  try {
    await service.removeImage(req.params.productId, req.params.imageId, req.user.id);
    sendSuccess(res, { message: 'Image removed' });
  } catch (err) { next(err); }
};

const reorderImages = async (req, res, next) => {
  try {
    await service.reorderImages(req.params.productId, req.body.items, req.user.id);
    sendSuccess(res, { message: 'Images reordered' });
  } catch (err) { next(err); }
};

const updateInventory = async (req, res, next) => {
  try {
    const data = await service.updateInventory(req.params.id, req.body, req.user.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const data = await service.updateStatus(req.params.id, req.body.status);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const toggleFeatured = async (req, res, next) => {
  try {
    const data = await service.toggleFeatured(req.params.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

module.exports = {
  getAll, getOne, getRelated, create, update, remove,
  uploadImages, deleteImage, reorderImages,
  updateInventory, updateStatus, toggleFeatured,
};