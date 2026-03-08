const service = require('./category.service');
const { sendSuccess, sendCreated, sendNotFound, paginationMeta } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getFlat = async (req, res, next) => {
  try {
    const data = await service.getFlat();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getFeatured = async (req, res, next) => {
  try {
    const data = await service.getFeatured();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const data = await service.getOne(req.params.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getCategoryProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { items, total } = await service.getCategoryProducts(req.params.id, req.query);
    sendSuccess(res, items, 200, paginationMeta({ page, limit, total }));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    sendCreated(res, data);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    sendSuccess(res, { message: 'Category deleted successfully' });
  } catch (err) { next(err); }
};

const reorder = async (req, res, next) => {
  try {
    await service.reorder(req.body.items);
    sendSuccess(res, { message: 'Categories reordered' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getFlat, getFeatured, getOne, getCategoryProducts, create, update, remove, reorder };