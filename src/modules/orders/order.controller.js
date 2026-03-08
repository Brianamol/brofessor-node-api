const service = require('./order.service');
const { sendSuccess, sendCreated, paginationMeta } = require('../../utils/response');
const { ROLES } = require('../../middleware/role.middleware');

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body, req.user.id);
    sendCreated(res, data);
  } catch (err) { next(err); }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { items, total } = await service.getMyOrders(req.user.id, req.query);
    sendSuccess(res, items, 200, paginationMeta({ page, limit, total }));
  } catch (err) { next(err); }
};

const getSellingOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { items, total } = await service.getSellingOrders(req.user.id, req.query);
    sendSuccess(res, items, 200, paginationMeta({ page, limit, total }));
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { items, total } = await service.getAll(req.query);
    sendSuccess(res, items, 200, paginationMeta({ page, limit, total }));
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes(ROLES.ADMIN);
    const data = await service.getOne(req.params.id, req.user.id, isAdmin);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const data = await service.updateStatus(req.params.id, status, note, req.user.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    await service.cancel(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Order cancelled successfully' });
  } catch (err) { next(err); }
};

module.exports = { create, getMyOrders, getSellingOrders, getAll, getOne, updateStatus, cancel };