const prisma = require('../../config/database');
const { AppError } = require('../../middleware/error.middleware');

// ─────────────────────────────────────────────
//  Generate human-readable order number
// ─────────────────────────────────────────────

async function generateOrderNumber() {
  const year  = new Date().getFullYear();
  const count = await prisma.order.count();
  return `ORD-${year}-${String(count + 1).padStart(5, '0')}`;
}

// ─────────────────────────────────────────────
//  Create order
// ─────────────────────────────────────────────

async function create({ items, addressId, couponCode, buyerNote }, buyerId) {
  // 1. Validate all items and fetch current prices
  const productIds = items.map((i) => i.productId);
  const products   = await prisma.product.findMany({
    where:   { id: { in: productIds }, status: 'ACTIVE' },
    include: { inventory: true, variants: { include: { inventory: true } } },
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products are unavailable', 400);
  }

  // 2. Check stock and build order items
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null;

    const inventory = variant ? variant.inventory : product.inventory;
    const available = (inventory?.quantity || 0) - (inventory?.reserved || 0);

    if (available < item.quantity) {
      throw new AppError(`Insufficient stock for: ${product.name}`, 400);
    }

    const unitPrice = parseFloat(variant?.price || product.price);
    const total     = unitPrice * item.quantity;
    subtotal += total;

    orderItems.push({
      productId:   product.id,
      variantId:   variant?.id || null,
      productName: product.name,
      variantName: variant?.name || null,
      imageUrl:    null, // Will be filled from product images if needed
      quantity:    item.quantity,
      unitPrice,
      totalPrice:  total,
    });
  }

  // 3. Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode, subtotal);
    discount = calculateDiscount(coupon, subtotal);
  }

  // 4. Calculate shipping
  const shippingFee = await calculateShipping(addressId, orderItems);

  // 5. Create everything in one transaction
  const total        = subtotal - discount + shippingFee;
  const orderNumber  = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        buyerId,
        addressId,
        subtotal,
        shippingFee,
        discount,
        total,
        couponCode: couponCode || null,
        couponDiscount: discount || null,
        buyerNote,
        items: { create: orderItems },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed', changedBy: buyerId },
        },
      },
      include: { items: true },
    });

    // Reserve inventory
    for (const item of items) {
      const where = item.variantId
        ? { variantId: item.variantId }
        : { productId: item.productId };

      await tx.inventory.update({
        where,
        data: { reserved: { increment: item.quantity } },
      });
    }

    // Increment coupon usage
    if (couponCode) {
      await tx.coupon.update({
        where: { code: couponCode },
        data:  { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  return order;
}

// ─────────────────────────────────────────────
//  Get orders
// ─────────────────────────────────────────────

async function getMyOrders(buyerId, query) {
  const { page = 1, limit = 10, status } = query;
  const where = { buyerId, ...(status && { status }) };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip:    (page - 1) * parseInt(limit),
      take:    parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        payments: { select: { status: true, amount: true, method: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total };
}

async function getSellingOrders(sellerId, query) {
  const { page = 1, limit = 10, status } = query;

  // Find orders that contain products owned by this seller
  const where = {
    items: { some: { product: { sellerId } } },
    ...(status && { status }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip:    (page - 1) * parseInt(limit),
      take:    parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          where:   { product: { sellerId } },
          include: { product: { select: { name: true, id: true } } },
        },
        buyer: { select: { username: true, email: true, phone: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total };
}

async function getAll(query) {
  const { page = 1, limit = 20, status, paymentStatus } = query;
  const where = {
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip:    (page - 1) * parseInt(limit),
      take:    parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        buyer:    { select: { username: true, email: true } },
        items:    { select: { quantity: true, totalPrice: true } },
        payments: { select: { status: true, method: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total };
}

async function getOne(id, userId, isAdmin = false) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items:          { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
      address:        true,
      payments:       true,
      statusHistory:  { orderBy: { createdAt: 'asc' } },
      buyer:          { select: { username: true, email: true, phone: true } },
    },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (!isAdmin && order.buyerId !== userId) throw new AppError('Access denied', 403);

  return order;
}

// ─────────────────────────────────────────────
//  Update status
// ─────────────────────────────────────────────

async function updateStatus(id, status, note, changedBy) {
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) throw new AppError('Order not found', 404);

  return prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status } }),
    prisma.orderStatusHistory.create({ data: { orderId: id, status, note, changedBy } }),
  ]);
}

// ─────────────────────────────────────────────
//  Cancel order
// ─────────────────────────────────────────────

async function cancel(id, userId) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.buyerId !== userId) throw new AppError('Access denied', 403);
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } }),
    prisma.orderStatusHistory.create({ data: { orderId: id, status: 'CANCELLED', note: 'Cancelled by buyer', changedBy: userId } }),
    // Release reserved inventory
    ...order.items.map((item) => {
      const where = item.variantId ? { variantId: item.variantId } : { productId: item.productId };
      return prisma.inventory.update({ where, data: { reserved: { decrement: item.quantity } } });
    }),
  ]);
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

async function validateCoupon(code, subtotal) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) throw new AppError('Invalid or expired coupon', 400);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError('Coupon has expired', 400);
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new AppError('Coupon usage limit reached', 400);
  if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount)) {
    throw new AppError(`Minimum order of KES ${coupon.minOrderAmount} required for this coupon`, 400);
  }
  return coupon;
}

function calculateDiscount(coupon, subtotal) {
  if (coupon.type === 'PERCENTAGE') return (subtotal * parseFloat(coupon.value)) / 100;
  if (coupon.type === 'FIXED_AMOUNT') return Math.min(parseFloat(coupon.value), subtotal);
  return 0;
}

async function calculateShipping(addressId, items) {
  if (!addressId) return 0;

  const address = await prisma.address.findUnique({ where: { id: addressId }, select: { county: true } });
  if (!address) return 0;

  const zone = await prisma.shippingZone.findFirst({
    where: { counties: { path: '$', array_contains: address.county }, isActive: true },
  });

  return zone ? parseFloat(zone.baseFee) : 300; // Default KES 300 if no zone matches
}

module.exports = { create, getMyOrders, getSellingOrders, getAll, getOne, updateStatus, cancel };