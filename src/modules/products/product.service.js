const prisma = require('../../config/database');
const { deleteImage, uploadToCloudinary } = require('../../config/cloudinary');
const { AppError } = require('../../middleware/error.middleware');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
//  List products with filters
// ─────────────────────────────────────────────

async function getAll(query) {
  const {
    page = 1, limit = 20,
    categoryId, sellerId, status = 'ACTIVE',
    minPrice, maxPrice, condition,
    sort = 'createdAt', order = 'desc',
    featured,
  } = query;

  const skip = (page - 1) * parseInt(limit);

  const where = {};

  // Only admins can see non-ACTIVE products — caller should pre-filter
  if (status) where.status = status;
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (sellerId)   where.sellerId   = sellerId;
  if (condition)  where.condition  = condition;
  if (featured === 'true') where.isFeatured = true;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const orderBy = buildOrderBy(sort, order);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip:    parseInt(skip),
      take:    parseInt(limit),
      orderBy,
      select: {
        id: true, name: true, slug: true, price: true,
        comparePrice: true, condition: true, status: true,
        freeShipping: true, rating: true, reviewCount: true,
        soldCount: true, isFeatured: true, createdAt: true,
        images:    { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        category:  { select: { id: true, name: true, slug: true } },
        seller:    { select: { id: true, username: true, sellerProfile: { select: { businessName: true, rating: true } } } },
        inventory: { select: { quantity: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

function buildOrderBy(sort, order) {
  const allowed = ['createdAt', 'price', 'rating', 'soldCount', 'viewCount'];
  const field = allowed.includes(sort) ? sort : 'createdAt';
  return { [field]: order };
}

// ─────────────────────────────────────────────
//  Get single product
// ─────────────────────────────────────────────

async function getOne(idOrSlug, viewerId = null) {
  const isId = !isNaN(parseInt(idOrSlug));
  const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

  const product = await prisma.product.findUnique({
    where,
    include: {
      images:     { orderBy: { sortOrder: 'asc' } },
      variants:   { include: { inventory: true } },
      inventory:  true,
      attributes: true,
      tags:       { include: { tag: true } },
      category:   {
        include: {
          parent: { include: { parent: { include: { parent: true } } } }, // breadcrumb
        },
      },
      seller: {
        select: {
          id: true, username: true,
          sellerProfile: {
            select: { businessName: true, rating: true, totalSales: true, isVerified: true, logoUrl: true },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, avatarUrl: true } } },
      },
    },
  });

  if (!product) throw new AppError('Product not found', 404);

  // Increment view count asynchronously (don't await)
  prisma.product.update({
    where: { id: product.id },
    data:  { viewCount: { increment: 1 } },
  }).catch(() => {});

  return product;
}

// ─────────────────────────────────────────────
//  Get related products
// ─────────────────────────────────────────────

async function getRelated(productId) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
    select: { categoryId: true, price: true },
  });

  if (!product) throw new AppError('Product not found', 404);

  return prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status:     'ACTIVE',
      id:         { not: parseInt(productId) },
    },
    take: 8,
    orderBy: { soldCount: 'desc' },
    select: {
      id: true, name: true, slug: true, price: true,
      comparePrice: true, rating: true, soldCount: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });
}

// ─────────────────────────────────────────────
//  Create product
// ─────────────────────────────────────────────

async function create(data, sellerId) {
  const slug = await generateUniqueSlug(data.name);
  const sku  = data.sku || generateSKU(data.name);

  const { attributes = [], tags = [], variants = [], ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      sku,
      sellerId,
      attributes: { create: attributes },
      tags: {
        create: await resolveTags(tags),
      },
      inventory: {
        create: { quantity: data.stockQuantity || 0 },
      },
    },
    include: { images: true, inventory: true },
  });

  return product;
}

// ─────────────────────────────────────────────
//  Update product
// ─────────────────────────────────────────────

async function update(id, data, userId) {
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.sellerId !== userId) throw new AppError('You do not own this product', 403);

  const { attributes, ...rest } = data;

  if (data.name && data.name !== product.name) {
    rest.slug = await generateUniqueSlug(data.name, id);
  }

  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      ...(attributes && {
        attributes: {
          deleteMany: {},
          create: attributes,
        },
      }),
    },
  });

  return updated;
}

// ─────────────────────────────────────────────
//  Delete product
// ─────────────────────────────────────────────

async function remove(id, userId, isAdmin = false) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { images: true },
  });

  if (!product) throw new AppError('Product not found', 404);
  if (!isAdmin && product.sellerId !== userId) {
    throw new AppError('You do not own this product', 403);
  }

  // Delete Cloudinary images
  await Promise.allSettled(
    product.images.map((img) => deleteImage(img.publicId))
  );

  await prisma.product.delete({ where: { id: parseInt(id) } });
}

// ─────────────────────────────────────────────
//  Image management
// ─────────────────────────────────────────────

async function addImages(productId, files, userId) {
  const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.sellerId !== userId) throw new AppError('Forbidden', 403);

  const existingCount = await prisma.productImage.count({ where: { productId: parseInt(productId) } });
  const hasPrimary    = existingCount > 0;

  // Upload all buffers to Cloudinary in parallel
  const uploaded = await Promise.all(
    files.map((file) =>
      uploadToCloudinary(file.buffer, `marketplace/products/${productId}`)
    )
  );

  const images = await prisma.$transaction(
    uploaded.map((result, index) =>
      prisma.productImage.create({
        data: {
          productId:  parseInt(productId),
          url:        result.url,
          publicId:   result.publicId,
          width:      result.width,
          height:     result.height,
          isPrimary:  !hasPrimary && index === 0,
          sortOrder:  existingCount + index,
        },
      })
    )
  );

  return images;
}

async function removeImage(productId, imageId, userId) {
  const image = await prisma.productImage.findUnique({
    where: { id: parseInt(imageId) },
    include: { product: { select: { sellerId: true } } },
  });

  if (!image || image.productId !== parseInt(productId)) {
    throw new AppError('Image not found', 404);
  }
  if (image.product.sellerId !== userId) throw new AppError('Forbidden', 403);

  await deleteImage(image.publicId);
  await prisma.productImage.delete({ where: { id: parseInt(imageId) } });

  // If deleted image was primary, promote first remaining image
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: parseInt(productId) },
      orderBy: { sortOrder: 'asc' },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
}

async function reorderImages(productId, items, userId) {
  const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.sellerId !== userId) throw new AppError('Forbidden', 403);

  const updates = items.map(({ id, sortOrder, isPrimary }) =>
    prisma.productImage.update({ where: { id }, data: { sortOrder, isPrimary: isPrimary || false } })
  );
  await prisma.$transaction(updates);
}

// ─────────────────────────────────────────────
//  Inventory & status
// ─────────────────────────────────────────────

async function updateInventory(id, { quantity }, userId) {
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.sellerId !== userId) throw new AppError('Forbidden', 403);

  return prisma.inventory.upsert({
    where:  { productId: parseInt(id) },
    create: { productId: parseInt(id), quantity },
    update: { quantity },
  });
}

async function updateStatus(id, status) {
  return prisma.product.update({
    where: { id: parseInt(id) },
    data:  { status },
  });
}

async function toggleFeatured(id) {
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) }, select: { isFeatured: true } });
  if (!product) throw new AppError('Product not found', 404);
  return prisma.product.update({ where: { id: parseInt(id) }, data: { isFeatured: !product.isFeatured } });
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

async function generateUniqueSlug(name, excludeId = null) {
  let slug = slugify(name, { lower: true, strict: true });
  let suffix = 0;
  let candidate = slug;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === parseInt(excludeId)) break;
    suffix++;
    candidate = `${slug}-${suffix}`;
  }

  return candidate;
}

function generateSKU(name) {
  const prefix = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  return `${prefix}-${uuidv4().slice(0, 6).toUpperCase()}`;
}

async function resolveTags(tagNames) {
  return Promise.all(
    tagNames.map(async (name) => {
      const slug = slugify(name, { lower: true, strict: true });
      const tag = await prisma.tag.upsert({
        where:  { slug },
        create: { name, slug },
        update: {},
      });
      return { tagId: tag.id };
    })
  );
}

module.exports = {
  getAll, getOne, getRelated, create, update, remove,
  addImages, removeImage, reorderImages,
  updateInventory, updateStatus, toggleFeatured,
};