const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─────────────────────────────────────────────
//  Category tree seed (eBay-style deep hierarchy)
// ─────────────────────────────────────────────

const categoryTree = [
  {
    name: 'Electronics', slug: 'electronics', level: 1, sortOrder: 1, isFeatured: true,
    icon: '🔌',
    children: [
      {
        name: 'Phones & Tablets', slug: 'phones-tablets', level: 2, sortOrder: 1,
        children: [
          { name: 'Smartphones',       slug: 'smartphones',       level: 3, sortOrder: 1 },
          { name: 'Tablets',           slug: 'tablets',           level: 3, sortOrder: 2 },
          { name: 'Feature Phones',    slug: 'feature-phones',    level: 3, sortOrder: 3 },
          { name: 'Phone Accessories', slug: 'phone-accessories', level: 3, sortOrder: 4,
            children: [
              { name: 'Cases & Covers',     slug: 'cases-covers',     level: 4 },
              { name: 'Screen Protectors',  slug: 'screen-protectors', level: 4 },
              { name: 'Chargers & Cables',  slug: 'chargers-cables',  level: 4 },
            ],
          },
        ],
      },
      {
        name: 'Computers', slug: 'computers', level: 2, sortOrder: 2,
        children: [
          { name: 'Laptops',             slug: 'laptops',             level: 3 },
          { name: 'Desktops',            slug: 'desktops',            level: 3 },
          { name: 'Computer Accessories',slug: 'computer-accessories',level: 3 },
        ],
      },
      {
        name: 'TVs & Audio', slug: 'tvs-audio', level: 2, sortOrder: 3,
        children: [
          { name: 'Televisions', slug: 'televisions', level: 3 },
          { name: 'Speakers',    slug: 'speakers',    level: 3 },
          { name: 'Headphones',  slug: 'headphones',  level: 3 },
        ],
      },
    ],
  },
  {
    name: 'Fashion', slug: 'fashion', level: 1, sortOrder: 2, isFeatured: true,
    icon: '👗',
    children: [
      {
        name: "Men's Clothing", slug: 'mens-clothing', level: 2, sortOrder: 1,
        children: [
          { name: 'Shirts & T-Shirts', slug: 'mens-shirts', level: 3 },
          { name: 'Trousers & Jeans',  slug: 'mens-trousers', level: 3 },
          { name: 'Shoes',             slug: 'mens-shoes', level: 3 },
          { name: 'Suits & Formal',    slug: 'mens-suits', level: 3 },
        ],
      },
      {
        name: "Women's Clothing", slug: 'womens-clothing', level: 2, sortOrder: 2,
        children: [
          { name: 'Dresses',    slug: 'dresses',        level: 3 },
          { name: 'Tops',       slug: 'womens-tops',    level: 3 },
          { name: 'Shoes',      slug: 'womens-shoes',   level: 3 },
          { name: 'Bags',       slug: 'womens-bags',    level: 3 },
        ],
      },
      {
        name: "Kids' Fashion", slug: 'kids-fashion', level: 2, sortOrder: 3,
        children: [
          { name: "Boys' Clothing",  slug: 'boys-clothing',  level: 3 },
          { name: "Girls' Clothing", slug: 'girls-clothing', level: 3 },
          { name: "Kids' Shoes",     slug: 'kids-shoes',     level: 3 },
        ],
      },
    ],
  },
  {
    name: 'Home & Garden', slug: 'home-garden', level: 1, sortOrder: 3, isFeatured: true,
    icon: '🏠',
    children: [
      { name: 'Furniture',     slug: 'furniture',     level: 2 },
      { name: 'Kitchen',       slug: 'kitchen',       level: 2 },
      { name: 'Bedding',       slug: 'bedding',       level: 2 },
      { name: 'Garden Tools',  slug: 'garden-tools',  level: 2 },
    ],
  },
  {
    name: 'Vehicles', slug: 'vehicles', level: 1, sortOrder: 4, isFeatured: true,
    icon: '🚗',
    children: [
      { name: 'Cars',             slug: 'cars',             level: 2 },
      { name: 'Motorcycles',      slug: 'motorcycles',      level: 2 },
      { name: 'Car Accessories',  slug: 'car-accessories',  level: 2 },
      { name: 'Spare Parts',      slug: 'spare-parts',      level: 2 },
    ],
  },
  {
    name: 'Health & Beauty', slug: 'health-beauty', level: 1, sortOrder: 5,
    icon: '💄',
    children: [
      { name: 'Skincare',         slug: 'skincare',          level: 2 },
      { name: 'Hair Care',        slug: 'hair-care',         level: 2 },
      { name: 'Vitamins',         slug: 'vitamins',          level: 2 },
      { name: 'Fitness Equipment',slug: 'fitness-equipment', level: 2 },
    ],
  },
  {
    name: 'Books & Media', slug: 'books-media', level: 1, sortOrder: 6,
    icon: '📚',
    children: [
      { name: 'Books',     slug: 'books',      level: 2 },
      { name: 'Music',     slug: 'music',      level: 2 },
      { name: 'Movies',    slug: 'movies',     level: 2 },
      { name: 'Software',  slug: 'software',   level: 2 },
    ],
  },
  {
    name: 'Agriculture', slug: 'agriculture', level: 1, sortOrder: 7, isFeatured: true,
    icon: '🌾',
    children: [
      { name: 'Seeds & Seedlings',  slug: 'seeds',          level: 2 },
      { name: 'Fertilizers',        slug: 'fertilizers',    level: 2 },
      { name: 'Farm Equipment',     slug: 'farm-equipment', level: 2 },
      { name: 'Livestock',          slug: 'livestock',      level: 2 },
    ],
  },
];

// ─────────────────────────────────────────────
//  Seed helpers
// ─────────────────────────────────────────────

async function seedCategories(categories, parentId = null) {
  for (const cat of categories) {
    const { children, icon, ...data } = cat;
    const created = await prisma.category.upsert({
      where:  { slug: data.slug },
      create: { ...data, parentId, isActive: true },
      update: { ...data, parentId },
    });

    if (children?.length) {
      await seedCategories(children, created.id);
    }
  }
}

async function seedShippingZones() {
  const zones = [
    {
      name: 'Nairobi',
      counties: ['Nairobi'],
      baseFee: 150,
      freeAbove: 5000,
      estDays: '1-2',
      isActive: true,
    },
    {
      name: 'Central Kenya',
      counties: ['Kiambu', 'Murang\'a', 'Kirinyaga', 'Nyeri', 'Nyandarua'],
      baseFee: 250,
      freeAbove: 7000,
      estDays: '2-3',
      isActive: true,
    },
    {
      name: 'Coast',
      counties: ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta'],
      baseFee: 350,
      freeAbove: 8000,
      estDays: '2-4',
      isActive: true,
    },
    {
      name: 'Rest of Kenya',
      counties: ['Kisumu', 'Nakuru', 'Eldoret', 'Kisii', 'Thika'],
      baseFee: 300,
      freeAbove: 7500,
      estDays: '3-5',
      isActive: true,
    },
  ];

  for (const zone of zones) {
    await prisma.shippingZone.upsert({
      where:  { name: zone.name },
      create: zone,
      update: zone,
    }).catch(() =>
      prisma.shippingZone.create({ data: zone })
    );
  }
}

// ─────────────────────────────────────────────
//  Main seed
// ─────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...');

  console.log('  → Categories...');
  await seedCategories(categoryTree);

  console.log('  → Shipping zones...');
  await seedShippingZones();

  const categoryCount = await prisma.category.count();
  console.log(`✅ Seeded ${categoryCount} categories`);
  console.log('✅ Seeded shipping zones');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());