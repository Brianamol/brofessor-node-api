const prisma = require('../../config/database');
const { cacheAside } = require('../../config/redis');

// ─────────────────────────────────────────────
//  Full-text search using MySQL FULLTEXT index
//  Defined on products(name, description, shortDesc)
// ─────────────────────────────────────────────

async function search(query) {
  const {
    q = '',
    page = 1,
    limit = 20,
    categoryId,
    minPrice,
    maxPrice,
    condition,
    freeShipping,
    sort = 'relevance',
    order = 'desc',
    sellerId,
  } = query;

  const skip = (page - 1) * parseInt(limit);

  // Build the WHERE clause
  const where = { status: 'ACTIVE' };

  if (q.trim()) {
    // Use Prisma's full-text search (requires @@fulltext index in schema)
    where.OR = [
      { name:        { search: q.split(' ').join(' ') } },
      { description: { search: q.split(' ').join(' ') } },
      { shortDesc:   { search: q.split(' ').join(' ') } },
    ];
  }

  if (categoryId)   where.categoryId  = parseInt(categoryId);
  if (sellerId)     where.sellerId    = sellerId;
  if (condition)    where.condition   = condition;
  if (freeShipping === 'true') where.freeShipping = true;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // Build orderBy
  const orderByMap = {
    relevance:  { soldCount: 'desc' },   // Without FT score, use sold count as proxy
    price_asc:  { price: 'asc' },
    price_desc: { price: 'desc' },
    newest:     { createdAt: 'desc' },
    rating:     { rating: 'desc' },
    popular:    { viewCount: 'desc' },
  };

  const orderBy = orderByMap[sort] || orderByMap.relevance;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip:    parseInt(skip),
      take:    parseInt(limit),
      orderBy,
      select: {
        id: true, name: true, slug: true, price: true,
        comparePrice: true, condition: true, freeShipping: true,
        rating: true, reviewCount: true, soldCount: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { username: true, sellerProfile: { select: { businessName: true } } } },
        inventory: { select: { quantity: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Aggregate filters for the sidebar (facets)
  const facets = await buildFacets(where);

  return { items, total, facets };
}

// ─────────────────────────────────────────────
//  Autocomplete suggestions (fast, cached)
// ─────────────────────────────────────────────

async function suggestions(q) {
  if (!q || q.length < 2) return [];

  const cacheKey = `search:suggest:${q.toLowerCase()}`;

  return cacheAside(cacheKey, async () => {
    const results = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        name: { contains: q },
      },
      take:    8,
      orderBy: { soldCount: 'desc' },
      select:  { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
    });
    return results;
  }, 120); // Cache suggestions for 2 minutes
}

// ─────────────────────────────────────────────
//  Build facets for filter sidebar (eBay-style)
// ─────────────────────────────────────────────

async function buildFacets(baseWhere) {
  // Remove price filter to show full price range
  const { price: _price, ...whereWithoutPrice } = baseWhere;

  const [priceRange, conditions, categories] = await Promise.all([
    prisma.product.aggregate({
      where: whereWithoutPrice,
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.groupBy({
      by: ['condition'],
      where: baseWhere,
      _count: { condition: true },
    }),
    prisma.product.groupBy({
      by: ['categoryId'],
      where: baseWhere,
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    priceRange: {
      min: priceRange._min.price || 0,
      max: priceRange._max.price || 0,
    },
    conditions: conditions.map((c) => ({ value: c.condition, count: c._count.condition })),
    categories: categories.map((c) => ({ categoryId: c.categoryId, count: c._count.categoryId })),
  };
}

module.exports = { search, suggestions };