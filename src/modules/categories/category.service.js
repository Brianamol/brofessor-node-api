const prisma = require('../../config/database');
const { cacheAside, invalidatePattern } = require('../../config/redis');
const { AppError } = require('../../middleware/error.middleware');
const slugify = require('slugify');

const CACHE_TTL = 600; // 10 minutes — categories rarely change

// ─────────────────────────────────────────────
//  Build tree from flat list  (recursive)
// ─────────────────────────────────────────────

function buildTree(categories, parentId = null) {
  return categories
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }));
}

// ─────────────────────────────────────────────
//  Service functions
// ─────────────────────────────────────────────

async function getAll() {
  return cacheAside('categories:tree', async () => {
    const categories = await prisma.category.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true, name: true, slug: true, iconUrl: true,
        level: true, parentId: true, sortOrder: true, isFeatured: true,
        _count: { select: { products: true } },
      },
    });
    return buildTree(categories);
  }, CACHE_TTL);
}

async function getFlat() {
  return cacheAside('categories:flat', async () => {
    return prisma.category.findMany({
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
      select: { id: true, name: true, slug: true, parentId: true, level: true, isActive: true },
    });
  }, CACHE_TTL);
}

async function getFeatured() {
  return cacheAside('categories:featured', async () => {
    return prisma.category.findMany({
      where: { isFeatured: true, isActive: true, level: 1 },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          take: 6,
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
      },
    });
  }, CACHE_TTL);
}

async function getOne(id) {
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      parent:   { select: { id: true, name: true, slug: true } },
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count:   { select: { products: true } },
    },
  });

  if (!category) throw new AppError('Category not found', 404);
  return category;
}

async function getCategoryProducts(categoryId, query) {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;
  const skip = (page - 1) * limit;

  // Include products from all child categories (recursive via level filtering)
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where:   { categoryId: parseInt(categoryId), status: 'ACTIVE' },
      skip:    parseInt(skip),
      take:    parseInt(limit),
      orderBy: { [sort]: order },
      include: {
        images:    { where: { isPrimary: true }, take: 1 },
        inventory: { select: { quantity: true } },
        seller:    { select: { username: true, sellerProfile: { select: { businessName: true } } } },
      },
    }),
    prisma.product.count({ where: { categoryId: parseInt(categoryId), status: 'ACTIVE' } }),
  ]);

  return { items, total };
}

async function create(data) {
  const slug = slugify(data.name, { lower: true, strict: true });

  // Validate parent exists if provided
  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent) throw new AppError('Parent category not found', 404);
    data.level = parent.level + 1;
    if (data.level > 4) throw new AppError('Maximum category depth is 4 levels', 400);
  }

  const category = await prisma.category.create({
    data: { ...data, slug },
  });

  await invalidatePattern('categories:*');
  return category;
}

async function update(id, data) {
  await getOne(id); // Throws 404 if not found

  if (data.name) {
    data.slug = slugify(data.name, { lower: true, strict: true });
  }

  const updated = await prisma.category.update({
    where: { id: parseInt(id) },
    data,
  });

  await invalidatePattern('categories:*');
  return updated;
}

async function remove(id) {
  const category = await getOne(id);

  const productCount = await prisma.product.count({
    where: { categoryId: parseInt(id), status: { in: ['ACTIVE', 'DRAFT'] } },
  });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete a category with ${productCount} active products. Move or archive them first.`,
      400
    );
  }

  if (category.children?.length > 0) {
    throw new AppError('Cannot delete a category that has subcategories', 400);
  }

  await prisma.category.delete({ where: { id: parseInt(id) } });
  await invalidatePattern('categories:*');
}

async function reorder(items) {
  // items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 1 }, ...]
  const updates = items.map(({ id, sortOrder }) =>
    prisma.category.update({ where: { id }, data: { sortOrder } })
  );
  await prisma.$transaction(updates);
  await invalidatePattern('categories:*');
}

module.exports = { getAll, getFlat, getFeatured, getOne, getCategoryProducts, create, update, remove, reorder };