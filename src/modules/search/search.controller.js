const service = require('./search.service');
const { sendSuccess, paginationMeta } = require('../../utils/response');

const search = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { items, total, facets } = await service.search(req.query);
    sendSuccess(res, { items, facets }, 200, paginationMeta({ page, limit, total }));
  } catch (err) { next(err); }
};

const suggestions = async (req, res, next) => {
  try {
    const data = await service.suggestions(req.query.q);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

module.exports = { search, suggestions };