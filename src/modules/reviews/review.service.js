// review.service.js
const prisma = require('../../config/database');
const { AppError } = require('../../middleware/error.middleware');

async function getForProduct(productId, query) {
  const { page = 1, limit = 10 } = query;

  const [items, total, stats] = await Promise.all([
    prisma.review.findMany({
      where:   { productId: parseInt(productId), isApproved: true },
      skip:    (page - 1) * parseInt(limit),
      take:    parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, avatarUrl: true } } },
    }),
    prisma.review.count({ where: { productId: parseInt(productId), isApproved: true } }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { productId: parseInt(productId), isApproved: true },
      _count: { rating: true },
    }),
  ]);

  return { items, total, ratingBreakdown: stats };
}

async function create(productId, data, userId) {
  // Verify the user actually purchased this product
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId: parseInt(productId),
      order: { buyerId: userId, paymentStatus: 'PAID' },
    },
  });

  const review = await prisma.review.create({
    data: {
      productId:  parseInt(productId),
      userId,
      rating:     data.rating,
      title:      data.title,
      body:       data.body,
      isVerified: !!purchase,
      isApproved: false, // Requires admin approval
    },
  });

  await recalculateProductRating(parseInt(productId));
  return review;
}

async function update(id, data, userId) {
  const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
  if (!review || review.userId !== userId) throw new AppError('Review not found', 404);

  const updated = await prisma.review.update({
    where: { id: parseInt(id) },
    data: { rating: data.rating, title: data.title, body: data.body },
  });

  await recalculateProductRating(review.productId);
  return updated;
}

async function remove(id, userId, isAdmin = false) {
  const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
  if (!review) throw new AppError('Review not found', 404);
  if (!isAdmin && review.userId !== userId) throw new AppError('Forbidden', 403);
  await prisma.review.delete({ where: { id: parseInt(id) } });
  await recalculateProductRating(review.productId);
}

async function approve(id) {
  return prisma.review.update({ where: { id: parseInt(id) }, data: { isApproved: true } });
}

async function recalculateProductRating(productId) {
  const result = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg:   { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating:      result._avg.rating || 0,
      reviewCount: result._count.rating,
    },
  });
}

module.exports = { getForProduct, create, update, remove, approve };