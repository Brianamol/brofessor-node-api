const service = require('./review.service');
const { sendSuccess, sendCreated, paginationMeta } = require('../../utils/response');
const { ROLES } = require('../../middleware/role.middleware');

const getForProduct = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { items, total, ratingBreakdown } = await service.getForProduct(req.params.productId, req.query);
    sendSuccess(res, { items, ratingBreakdown }, 200, paginationMeta({ page, limit, total }));
  } catch (e) { next(e); }
};

const create  = async (req, res, next) => { try { sendCreated(res, await service.create(req.params.productId, req.body, req.user.id)); } catch (e) { next(e); } };
const update  = async (req, res, next) => { try { sendSuccess(res, await service.update(req.params.id, req.body, req.user.id)); } catch (e) { next(e); } };
const remove  = async (req, res, next) => { try { const isAdmin = req.user.roles.includes(ROLES.ADMIN); await service.remove(req.params.id, req.user.id, isAdmin); sendSuccess(res, { message: 'Review deleted' }); } catch (e) { next(e); } };
const approve = async (req, res, next) => { try { sendSuccess(res, await service.approve(req.params.id)); } catch (e) { next(e); } };

module.exports = { getForProduct, create, update, remove, approve };