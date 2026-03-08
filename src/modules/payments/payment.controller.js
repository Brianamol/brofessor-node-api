const service = require('./payment.service');
const { sendSuccess, sendCreated, paginationMeta } = require('../../utils/response');
const { ROLES } = require('../../middleware/role.middleware');
const logger = require('../../utils/logger');

const initiatePayment = async (req, res, next) => {
  try {
    const data = await service.initiatePayment(req.body, req.user.id);
    sendCreated(res, data);
  } catch (err) { next(err); }
};

// ⚠️ This endpoint is called by Safaricom, not the browser
// Must always return 200 — Safaricom will retry on non-200
const mpesaCallback = async (req, res) => {
  try {
    await service.handleMpesaCallback(req.body);
  } catch (err) {
    logger.error('M-Pesa callback processing error:', err);
    // Don't re-throw — still return 200 to Safaricom to prevent retries
  }
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
};

const queryStatus = async (req, res, next) => {
  try {
    const data = await service.queryPaymentStatus(req.params.checkoutRequestId, req.user.id);
    sendSuccess(res, data);
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

module.exports = { initiatePayment, mpesaCallback, queryStatus, getAll, getOne };