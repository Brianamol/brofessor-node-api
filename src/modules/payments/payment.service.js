const prisma = require('../../config/database');
const { initiateSTKPush, querySTKStatus, parseSTKCallback } = require('../../config/mpesa');
const { AppError } = require('../../middleware/error.middleware');
const logger = require('../../utils/logger');

// ─────────────────────────────────────────────
//  Initiate M-Pesa payment for an order
// ─────────────────────────────────────────────

async function initiatePayment({ orderId, phone }, buyerId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, buyerId: true, total: true, paymentStatus: true, orderNumber: true },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.buyerId !== buyerId) throw new AppError('Access denied', 403);
  if (order.paymentStatus === 'PAID') throw new AppError('Order is already paid', 400);

  // Create a pending payment record before calling Safaricom
  const payment = await prisma.payment.create({
    data: {
      orderId:     order.id,
      method:      'MPESA',
      status:      'INITIATED',
      amount:      order.total,
      mpesaPhoneNumber: phone,
    },
  });

  try {
    // Trigger STK Push on customer's phone
    const response = await initiateSTKPush({
      phone,
      amount:  Math.ceil(parseFloat(order.total)),
      orderId: order.orderNumber,
    });

    // Store the CheckoutRequestID — needed to match the callback
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpesaCheckoutId: response.CheckoutRequestID,
        status: 'PENDING',
      },
    });

    // Also update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PENDING' },
    });

    return {
      paymentId:        payment.id,
      checkoutRequestId: response.CheckoutRequestID,
      message: 'Check your phone for the M-Pesa PIN prompt',
    };

  } catch (error) {
    // Mark payment as failed if STK Push call itself fails
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}

// ─────────────────────────────────────────────
//  Handle Safaricom callback
//  This is called by Safaricom servers — NOT by the frontend
// ─────────────────────────────────────────────

async function handleMpesaCallback(callbackBody) {
  logger.info('M-Pesa callback received:', JSON.stringify(callbackBody));

  const result = parseSTKCallback(callbackBody);
  logger.info('Parsed M-Pesa result:', result);

  const payment = await prisma.payment.findUnique({
    where: { mpesaCheckoutId: result.checkoutId },
    select: { id: true, orderId: true },
  });

  if (!payment) {
    logger.warn(`No payment found for CheckoutRequestID: ${result.checkoutId}`);
    return; // Silently ignore — Safaricom may resend for other apps
  }

  if (result.success) {
    // ✅ Payment successful
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:               'SUCCESS',
          mpesaMpesaReceiptNo:  result.mpesaReceiptNo,
          mpesaResultCode:      result.resultCode,
          mpesaResultDesc:      result.resultDesc,
          rawCallback:          callbackBody,
          paidAt:               new Date(),
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'PAID',
          status:        'CONFIRMED',
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status:  'CONFIRMED',
          note:    `Payment confirmed. M-Pesa receipt: ${result.mpesaReceiptNo}`,
        },
      }),
    ]);

    // TODO: send order confirmation email/SMS here

    logger.info(`✅ Payment successful for order ${payment.orderId} — receipt: ${result.mpesaReceiptNo}`);

  } else {
    // ❌ Payment failed or cancelled by user
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:          result.resultCode === 1032 ? 'CANCELLED' : 'FAILED',
          mpesaResultCode: result.resultCode,
          mpesaResultDesc: result.resultDesc,
          rawCallback:     callbackBody,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'FAILED' },
      }),
    ]);

    logger.info(`❌ Payment failed for order ${payment.orderId} — code: ${result.resultCode} — ${result.resultDesc}`);
  }
}

// ─────────────────────────────────────────────
//  Query STK status (polling fallback)
// ─────────────────────────────────────────────

async function queryPaymentStatus(checkoutRequestId, userId) {
  const payment = await prisma.payment.findUnique({
    where: { mpesaCheckoutId: checkoutRequestId },
    include: { order: { select: { buyerId: true, paymentStatus: true, status: true } } },
  });

  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.order.buyerId !== userId) throw new AppError('Access denied', 403);

  // If still pending after >30s, query Safaricom directly
  if (payment.status === 'PENDING') {
    try {
      const safResponse = await querySTKStatus(checkoutRequestId);
      if (safResponse.ResultCode === '0') {
        // Update to success if not already done
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        });
        return { status: 'SUCCESS', orderStatus: 'CONFIRMED' };
      }
    } catch {
      // Query failed — return current DB status
    }
  }

  return {
    status:      payment.status,
    orderStatus: payment.order.status,
    receipt:     payment.mpesaMpesaReceiptNo,
  };
}

async function getAll(query) {
  const { page = 1, limit = 20, status } = query;
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip:    (page - 1) * parseInt(limit),
      take:    parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { orderNumber: true, buyerId: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return { items, total };
}

async function getOne(id, userId, isAdmin = false) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: { select: { buyerId: true, orderNumber: true } } },
  });

  if (!payment) throw new AppError('Payment not found', 404);
  if (!isAdmin && payment.order.buyerId !== userId) throw new AppError('Access denied', 403);

  return payment;
}

module.exports = { initiatePayment, handleMpesaCallback, queryPaymentStatus, getAll, getOne };