const service = require('./user.service');
const { sendSuccess, sendCreated, paginationMeta } = require('../../utils/response');

const getMe     = async (req, res, next) => { try { sendSuccess(res, await service.getMe(req.user.id)); } catch (e) { next(e); } };
const updateMe  = async (req, res, next) => { try { sendSuccess(res, await service.updateMe(req.user.id, req.body)); } catch (e) { next(e); } };
const uploadAvatar = async (req, res, next) => { try { sendSuccess(res, await service.uploadAvatar(req.user.id, req.file)); } catch (e) { next(e); } };
const syncFromKeycloak = async (req, res, next) => { try { sendSuccess(res, await service.syncFromKeycloak(req.user)); } catch (e) { next(e); } };
const getAddresses  = async (req, res, next) => { try { sendSuccess(res, await service.getAddresses(req.user.id)); } catch (e) { next(e); } };
const addAddress    = async (req, res, next) => { try { sendCreated(res, await service.addAddress(req.user.id, req.body)); } catch (e) { next(e); } };
const updateAddress = async (req, res, next) => { try { sendSuccess(res, await service.updateAddress(req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const deleteAddress = async (req, res, next) => { try { await service.deleteAddress(req.user.id, req.params.id); sendSuccess(res, { message: 'Address removed' }); } catch (e) { next(e); } };
const getWishlist   = async (req, res, next) => { try { sendSuccess(res, await service.getWishlist(req.user.id)); } catch (e) { next(e); } };
const addToWishlist = async (req, res, next) => { try { sendCreated(res, await service.addToWishlist(req.user.id, req.params.productId)); } catch (e) { next(e); } };
const removeFromWishlist = async (req, res, next) => { try { await service.removeFromWishlist(req.user.id, req.params.productId); sendSuccess(res, { message: 'Removed from wishlist' }); } catch (e) { next(e); } };
const createSellerProfile = async (req, res, next) => { try { sendCreated(res, await service.createSellerProfile(req.user.id, req.body)); } catch (e) { next(e); } };
const updateSellerProfile = async (req, res, next) => { try { sendSuccess(res, await service.updateSellerProfile(req.user.id, req.body)); } catch (e) { next(e); } };

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { items, total } = await service.getAll(req.query);
    sendSuccess(res, items, 200, paginationMeta({ page, limit, total }));
  } catch (e) { next(e); }
};

const getOne = async (req, res, next) => { try { sendSuccess(res, await service.getOne(req.params.id)); } catch (e) { next(e); } };
const updateStatus = async (req, res, next) => { try { sendSuccess(res, await service.updateStatus(req.params.id, req.body.isActive)); } catch (e) { next(e); } };

module.exports = {
  getMe, updateMe, uploadAvatar, syncFromKeycloak,
  getAddresses, addAddress, updateAddress, deleteAddress,
  getWishlist, addToWishlist, removeFromWishlist,
  createSellerProfile, updateSellerProfile,
  getAll, getOne, updateStatus,
};