// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─────────────────────────────────────────────
//  Test user IDs (fake Keycloak UUIDs)
// ─────────────────────────────────────────────

const USERS = {
  admin:   'aaaaaaaa-0000-4000-a000-000000000001',
  seller1: 'bbbbbbbb-0000-4000-a000-000000000002',
  seller2: 'cccccccc-0000-4000-a000-000000000003',
  seller3: 'dddddddd-0000-4000-a000-000000000004',
  buyer1:  'eeeeeeee-0000-4000-a000-000000000005',
  buyer2:  'ffffffff-0000-4000-a000-000000000006',
  buyer3:  '11111111-0000-4000-a000-000000000007',
};

const IMG = {
  samsung_a54:     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600',
  iphone_15:       'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
  laptop_dell:     'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',
  airpods:         'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600',
  tv_samsung:      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600',
  ps5:             'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600',
  camera_canon:    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',
  keyboard:        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600',
  sneakers_nike:   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  sneakers_adidas: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
  watch_casio:     'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  handbag:         'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
  jeans:           'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
  sofa:            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
  blender:         'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600',
  pressure_cooker: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600',
  mattress:        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
  gym_equipment:   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  vitamins:        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
  book1:           'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
};

// ─────────────────────────────────────────────
//  Category tree seed (your original, unchanged)
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
          {
            name: 'Phone Accessories', slug: 'phone-accessories', level: 3, sortOrder: 4,
            children: [
              { name: 'Cases & Covers',    slug: 'cases-covers',      level: 4 },
              { name: 'Screen Protectors', slug: 'screen-protectors', level: 4 },
              { name: 'Chargers & Cables', slug: 'chargers-cables',   level: 4 },
            ],
          },
        ],
      },
      {
        name: 'Computers', slug: 'computers', level: 2, sortOrder: 2,
        children: [
          { name: 'Laptops',              slug: 'laptops',              level: 3 },
          { name: 'Desktops',             slug: 'desktops',             level: 3 },
          { name: 'Computer Accessories', slug: 'computer-accessories', level: 3 },
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
          { name: 'Shirts & T-Shirts', slug: 'mens-shirts',   level: 3 },
          { name: 'Trousers & Jeans',  slug: 'mens-trousers', level: 3 },
          { name: 'Shoes',             slug: 'mens-shoes',    level: 3 },
          { name: 'Suits & Formal',    slug: 'mens-suits',    level: 3 },
        ],
      },
      {
        name: "Women's Clothing", slug: 'womens-clothing', level: 2, sortOrder: 2,
        children: [
          { name: 'Dresses', slug: 'dresses',      level: 3 },
          { name: 'Tops',    slug: 'womens-tops',  level: 3 },
          { name: 'Shoes',   slug: 'womens-shoes', level: 3 },
          { name: 'Bags',    slug: 'womens-bags',  level: 3 },
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
      { name: 'Furniture',    slug: 'furniture',    level: 2 },
      { name: 'Kitchen',      slug: 'kitchen',      level: 2 },
      { name: 'Bedding',      slug: 'bedding',      level: 2 },
      { name: 'Garden Tools', slug: 'garden-tools', level: 2 },
    ],
  },
  {
    name: 'Vehicles', slug: 'vehicles', level: 1, sortOrder: 4, isFeatured: true,
    icon: '🚗',
    children: [
      { name: 'Cars',            slug: 'cars',            level: 2 },
      { name: 'Motorcycles',     slug: 'motorcycles',     level: 2 },
      { name: 'Car Accessories', slug: 'car-accessories', level: 2 },
      { name: 'Spare Parts',     slug: 'spare-parts',     level: 2 },
    ],
  },
  {
    name: 'Health & Beauty', slug: 'health-beauty', level: 1, sortOrder: 5,
    icon: '💄',
    children: [
      { name: 'Skincare',          slug: 'skincare',          level: 2 },
      { name: 'Hair Care',         slug: 'hair-care',         level: 2 },
      { name: 'Vitamins',          slug: 'vitamins',          level: 2 },
      { name: 'Fitness Equipment', slug: 'fitness-equipment', level: 2 },
    ],
  },
  {
    name: 'Books & Media', slug: 'books-media', level: 1, sortOrder: 6,
    icon: '📚',
    children: [
      { name: 'Books',    slug: 'books',    level: 2 },
      { name: 'Music',    slug: 'music',    level: 2 },
      { name: 'Movies',   slug: 'movies',   level: 2 },
      { name: 'Software', slug: 'software', level: 2 },
    ],
  },
  {
    name: 'Agriculture', slug: 'agriculture', level: 1, sortOrder: 7, isFeatured: true,
    icon: '🌾',
    children: [
      { name: 'Seeds & Seedlings', slug: 'seeds',          level: 2 },
      { name: 'Fertilizers',       slug: 'fertilizers',    level: 2 },
      { name: 'Farm Equipment',    slug: 'farm-equipment', level: 2 },
      { name: 'Livestock',         slug: 'livestock',      level: 2 },
    ],
  },
];

// ─────────────────────────────────────────────
//  Seed helpers (your originals, unchanged)
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
    { name: 'Nairobi',       counties: ['Nairobi'],                                                            baseFee: 150, freeAbove: 5000, estDays: '1-2', isActive: true },
    { name: 'Central Kenya', counties: ["Kiambu", "Murang'a", "Kirinyaga", "Nyeri", "Nyandarua"],              baseFee: 250, freeAbove: 7000, estDays: '2-3', isActive: true },
    { name: 'Coast',         counties: ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta'],  baseFee: 350, freeAbove: 8000, estDays: '2-4', isActive: true },
    { name: 'Rest of Kenya', counties: ['Kisumu', 'Nakuru', 'Eldoret', 'Kisii', 'Thika'],                     baseFee: 300, freeAbove: 7500, estDays: '3-5', isActive: true },
  ];
  for (const zone of zones) {
    await prisma.shippingZone.upsert({
      where:  { name: zone.name },
      create: zone,
      update: zone,
    }).catch(() => prisma.shippingZone.create({ data: zone }));
  }
}

// ─────────────────────────────────────────────
//  New helper: create a full product with images,
//  attributes and inventory in one call
// ─────────────────────────────────────────────

async function createProduct({ images, attributes, quantity, ...data }) {
  return prisma.product.create({
    data: {
      ...data,
      status: 'ACTIVE',
      images: {
        create: images.map((img, i) => ({
          url:       img.url,
          publicId:  `brofessor/${data.sku.toLowerCase()}_${i}`,
          alt:       img.alt,
          isPrimary: img.isPrimary,
          sortOrder: i,
        })),
      },
      attributes: { create: attributes },
      inventory:  { create: { quantity, reserved: 0, lowStock: 5 } },
    },
  });
}

// ─────────────────────────────────────────────
//  Main seed
// ─────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Categories (your original) ─────────────────────────────────────────────
  console.log('  → Categories...');
  await seedCategories(categoryTree);
  console.log(`     ✅ ${await prisma.category.count()} categories`);

  // Look up category IDs we need for products
  const C = {};
  for (const slug of [
    'smartphones', 'laptops', 'televisions', 'headphones',
    'computer-accessories', 'cameras',
    'mens-shoes', 'womens-bags', 'watches-jewelry', 'mens-trousers',
    'furniture', 'kitchen', 'bedding',
    'fitness-equipment', 'vitamins', 'books',
  ]) {
    C[slug] = await prisma.category.findUnique({ where: { slug } });
  }

  // ── Shipping zones (your original) ────────────────────────────────────────
  console.log('  → Shipping zones...');
  await seedShippingZones();
  console.log(`     ✅ ${await prisma.shippingZone.count()} zones`);

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('  → Users...');
  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      { id: USERS.admin,   email: 'admin@brofessor.co.ke',      username: 'brofessor_admin',   firstName: 'Brian', lastName: 'Otieno',  phone: '+254700000001', isActive: true, isSeller: false, isVerified: true  },
      { id: USERS.seller1, email: 'techcity@brofessor.co.ke',   username: 'techcity_ke',        firstName: 'James', lastName: 'Kamau',   phone: '+254711000002', isActive: true, isSeller: true,  isVerified: true  },
      { id: USERS.seller2, email: 'fashionhub@brofessor.co.ke', username: 'fashionhub_nairobi', firstName: 'Amina', lastName: 'Wanjiru', phone: '+254722000003', isActive: true, isSeller: true,  isVerified: true  },
      { id: USERS.seller3, email: 'homepro@brofessor.co.ke',    username: 'homepro_ke',         firstName: 'Peter', lastName: 'Mwangi',  phone: '+254733000004', isActive: true, isSeller: true,  isVerified: false },
      { id: USERS.buyer1,  email: 'john.doe@gmail.com',         username: 'john_doe_ke',        firstName: 'John',  lastName: 'Doe',     phone: '+254744000005', isActive: true, isSeller: false, isVerified: true  },
      { id: USERS.buyer2,  email: 'mary.wambui@gmail.com',      username: 'mary_wambui',        firstName: 'Mary',  lastName: 'Wambui',  phone: '+254755000006', isActive: true, isSeller: false, isVerified: false },
      { id: USERS.buyer3,  email: 'kevin.ochieng@gmail.com',    username: 'kevin_ochieng',      firstName: 'Kevin', lastName: 'Ochieng', phone: '+254766000007', isActive: true, isSeller: false, isVerified: false },
    ],
  });
  console.log(`     ✅ ${await prisma.user.count()} users`);

  // ── Seller profiles ────────────────────────────────────────────────────────
  console.log('  → Seller profiles...');
  await prisma.sellerProfile.createMany({
    skipDuplicates: true,
    data: [
      { userId: USERS.seller1, businessName: 'TechCity Kenya',      businessType: 'company',    kraPin: 'A000111222B', description: "Nairobi's premier electronics store. Genuine phones, laptops and TVs with warranty.", rating: 4.8, totalSales: 1240, isVerified: true  },
      { userId: USERS.seller2, businessName: 'Fashion Hub Nairobi', businessType: 'individual', kraPin: 'A000333444C', description: 'Trendy fashion for the modern Kenyan. Clothes, shoes, bags and accessories.',           rating: 4.5, totalSales:  890, isVerified: true  },
      { userId: USERS.seller3, businessName: 'HomePro Kenya',       businessType: 'company',    kraPin: 'A000555666D', description: 'Your one-stop shop for home appliances, furniture and garden supplies.',               rating: 4.2, totalSales:  340, isVerified: false },
    ],
  });

  // ── Addresses ──────────────────────────────────────────────────────────────
  console.log('  → Addresses...');
  const addr1 = await prisma.address.create({ data: { userId: USERS.buyer1, label: 'Home', fullName: 'John Doe',      phone: '+254744000005', line1: 'Apt 4B, Parklands Towers', city: 'Nairobi', county: 'Nairobi', postalCode: '00100', isDefault: true } });
  const addr2 = await prisma.address.create({ data: { userId: USERS.buyer2, label: 'Home', fullName: 'Mary Wambui',   phone: '+254755000006', line1: 'House 12, Kiambu Road',    city: 'Kiambu',  county: 'Kiambu',  postalCode: '00900', isDefault: true } });
  const addr3 = await prisma.address.create({ data: { userId: USERS.buyer3, label: 'Home', fullName: 'Kevin Ochieng', phone: '+254766000007', line1: 'Flat 7, Kisumu Heights',   city: 'Kisumu',  county: 'Kisumu',  postalCode: '40100', isDefault: true } });

  // ── Products ───────────────────────────────────────────────────────────────
  console.log('  → Products...');

  const p1 = await createProduct({
    sku: 'SAM-A54-BLK-128', name: 'Samsung Galaxy A54 5G - 128GB Black', slug: 'samsung-galaxy-a54-5g-128gb-black',
    shortDesc: 'Powerful 5G phone with 50MP camera, 5000mAh battery and AMOLED display.',
    description: '<p><strong>Samsung Galaxy A54 5G</strong> — 6.4" Super AMOLED 120Hz, 50MP triple camera, 5000mAh battery, Android 14. Comes with 1-year Samsung Kenya warranty.</p>',
    price: 52000, comparePrice: 58000, costPrice: 42000,
    categoryId: C['smartphones'].id, sellerId: USERS.seller1,
    condition: 'NEW', isFeatured: true, freeShipping: true, weight: 0.202,
    rating: 4.7, reviewCount: 38, soldCount: 124, viewCount: 890,
    images: [{ url: IMG.samsung_a54, alt: 'Samsung Galaxy A54 5G', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Samsung' }, { name: 'Model', value: 'Galaxy A54 5G' },
      { name: 'Storage', value: '128GB' }, { name: 'RAM', value: '8GB' },
      { name: 'Display', value: '6.4" Super AMOLED 120Hz' }, { name: 'Battery', value: '5000mAh' },
      { name: 'OS', value: 'Android 14' }, { name: 'Warranty', value: '1 Year Samsung Kenya' },
    ],
    quantity: 45,
  });

  const p2 = await createProduct({
    sku: 'APPL-IP15-BLU-256', name: 'Apple iPhone 15 - 256GB Blue', slug: 'apple-iphone-15-256gb-blue',
    shortDesc: 'Dynamic Island, 48MP camera system, USB-C, A16 Bionic chip.',
    description: '<p><strong>Apple iPhone 15</strong> — 6.1" Super Retina XDR, 48MP camera, A16 Bionic, USB-C, Dynamic Island. Sealed in original box, 1-year warranty. Kenya duty paid.</p>',
    price: 135000, comparePrice: 148000, costPrice: 110000,
    categoryId: C['smartphones'].id, sellerId: USERS.seller1,
    condition: 'NEW', isFeatured: true, freeShipping: true, weight: 0.171,
    rating: 4.9, reviewCount: 52, soldCount: 89, viewCount: 1240,
    images: [{ url: IMG.iphone_15, alt: 'Apple iPhone 15 Blue', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Apple' }, { name: 'Model', value: 'iPhone 15' },
      { name: 'Storage', value: '256GB' }, { name: 'Chip', value: 'A16 Bionic' },
      { name: 'Display', value: '6.1" Super Retina XDR' }, { name: 'Charging', value: 'USB-C' },
      { name: 'Warranty', value: '1 Year Apple' },
    ],
    quantity: 18,
  });

  const p3 = await createProduct({
    sku: 'DELL-INS15-I5-512', name: 'Dell Inspiron 15 - Core i5, 8GB RAM, 512GB SSD', slug: 'dell-inspiron-15-i5-8gb-512ssd',
    shortDesc: 'Reliable everyday laptop — Core i5, fast NVMe SSD, Full HD, Windows 11.',
    description: '<p><strong>Dell Inspiron 15</strong> — Intel Core i5-1235U, 8GB DDR4, 512GB NVMe SSD, 15.6" FHD display, Windows 11 Home. Up to 8 hours battery life. 1-year Dell Kenya warranty.</p>',
    price: 78000, comparePrice: 89000, costPrice: 62000,
    categoryId: C['laptops'].id, sellerId: USERS.seller1,
    condition: 'NEW', isFeatured: true, freeShipping: true, weight: 1.78,
    rating: 4.6, reviewCount: 28, soldCount: 67, viewCount: 543,
    images: [{ url: IMG.laptop_dell, alt: 'Dell Inspiron 15', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Dell' }, { name: 'Processor', value: 'Intel Core i5-1235U (12th Gen)' },
      { name: 'RAM', value: '8GB DDR4' }, { name: 'Storage', value: '512GB NVMe SSD' },
      { name: 'Display', value: '15.6" Full HD' }, { name: 'OS', value: 'Windows 11 Home' },
      { name: 'Warranty', value: '1 Year Dell Kenya' },
    ],
    quantity: 22,
  });

  const p4 = await createProduct({
    sku: 'SONY-WH1000XM5-BLK', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', slug: 'sony-wh1000xm5-headphones-black',
    shortDesc: 'Industry-leading ANC, 30-hour battery, LDAC hi-res audio.',
    description: '<p><strong>Sony WH-1000XM5</strong> — 8-mic noise cancellation, 30h battery, 3-min quick charge (3h playback), multipoint, LDAC. Foldable with carry case included.</p>',
    price: 38000, comparePrice: 45000, costPrice: 28000,
    categoryId: C['headphones'].id, sellerId: USERS.seller1,
    condition: 'NEW', freeShipping: true, weight: 0.25,
    rating: 4.8, reviewCount: 44, soldCount: 58, viewCount: 678,
    images: [{ url: IMG.airpods, alt: 'Sony WH-1000XM5', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Sony' }, { name: 'Battery', value: '30 hours ANC on' },
      { name: 'Noise Cancellation', value: 'Industry-leading 8-mic ANC' },
      { name: 'Codec', value: 'LDAC, AAC, SBC' }, { name: 'Connectivity', value: 'Bluetooth 5.2' },
    ],
    quantity: 30,
  });

  const p5 = await createProduct({
    sku: 'SAM-TV65-QLED-4K', name: 'Samsung 65" QLED 4K Smart TV', slug: 'samsung-65-qled-4k-smart-tv',
    shortDesc: 'QLED 4K, 120Hz, Tizen OS, 4 HDMI ports, Gaming Hub.',
    description: '<p><strong>Samsung 65" QLED 4K</strong> — Quantum Dot, 4K UHD, 120Hz, Tizen OS (Netflix/YouTube/Prime), 4 HDMI, Gaming Hub with Xbox & GeForce Now support. 2-year warranty.</p>',
    price: 195000, comparePrice: 220000, costPrice: 155000,
    categoryId: C['televisions'].id, sellerId: USERS.seller1,
    condition: 'NEW', isFeatured: true, freeShipping: true, weight: 22.5,
    rating: 4.7, reviewCount: 19, soldCount: 23, viewCount: 412,
    images: [{ url: IMG.tv_samsung, alt: 'Samsung 65" QLED 4K TV', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Samsung' }, { name: 'Screen Size', value: '65"' },
      { name: 'Resolution', value: '4K UHD' }, { name: 'Panel', value: 'QLED' },
      { name: 'Smart OS', value: 'Tizen' }, { name: 'Refresh Rate', value: '120Hz' },
      { name: 'Warranty', value: '2 Years Samsung Kenya' },
    ],
    quantity: 8,
  });

  const p6 = await createProduct({
    sku: 'SONY-PS5-DISC', name: 'Sony PlayStation 5 Disc Edition', slug: 'sony-playstation-5-disc-edition',
    shortDesc: 'Ultra-fast SSD, 4K gaming, ray tracing, DualSense haptic feedback.',
    description: '<p><strong>Sony PS5</strong> — custom SSD with near-zero load times, 4K 60fps, ray tracing, DualSense haptic feedback, 3D audio, backward compatible with PS4 games.</p>',
    price: 78000, comparePrice: 85000, costPrice: 62000,
    categoryId: C['computer-accessories'].id, sellerId: USERS.seller1,
    condition: 'NEW', isFeatured: true, freeShipping: true, weight: 4.5,
    rating: 4.9, reviewCount: 31, soldCount: 45, viewCount: 890,
    images: [{ url: IMG.ps5, alt: 'Sony PlayStation 5', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Sony' }, { name: 'Storage', value: '825GB Custom SSD' },
      { name: 'Resolution', value: 'Up to 4K' }, { name: 'Drive', value: 'Ultra HD Blu-ray' },
    ],
    quantity: 12,
  });

  const p7 = await createProduct({
    sku: 'CANON-EOS90D-KIT', name: 'Canon EOS 90D DSLR + 18-135mm Lens', slug: 'canon-eos-90d-dslr-18-135mm',
    shortDesc: '32.5MP sensor, 4K video, 10fps burst, weather-sealed body.',
    description: '<p><strong>Canon EOS 90D</strong> — 32.5MP APS-C, 4K 30fps video, 10fps burst, 45-point AF, weather-sealed, vari-angle touchscreen, WiFi. Includes EF-S 18-135mm f/3.5-5.6 IS USM lens.</p>',
    price: 145000, comparePrice: 165000, costPrice: 118000,
    categoryId: C['cameras'].id, sellerId: USERS.seller1,
    condition: 'NEW', freeShipping: true, weight: 1.33,
    rating: 4.8, reviewCount: 14, soldCount: 19, viewCount: 287,
    images: [{ url: IMG.camera_canon, alt: 'Canon EOS 90D', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Canon' }, { name: 'Sensor', value: '32.5MP APS-C CMOS' },
      { name: 'Video', value: '4K 30fps' }, { name: 'Lens', value: 'EF-S 18-135mm IS USM' },
    ],
    quantity: 6,
  });

  const p8 = await createProduct({
    sku: 'MEC-KB-RGB-TKL', name: 'Wireless Mechanical Gaming Keyboard RGB TKL', slug: 'wireless-mechanical-gaming-keyboard-rgb',
    shortDesc: 'TKL, red switches, per-key RGB, 2.4GHz + Bluetooth + USB-C.',
    description: '<p><strong>Wireless TKL Mechanical Keyboard</strong> — 2.4GHz/BT5/USB-C, per-key RGB (18 effects), red linear switches, 2000mAh battery (~200h without RGB), N-key rollover.</p>',
    price: 8500, comparePrice: 11000, costPrice: 5500,
    categoryId: C['computer-accessories'].id, sellerId: USERS.seller1,
    condition: 'NEW', freeShipping: false, weight: 0.65,
    rating: 4.4, reviewCount: 23, soldCount: 87, viewCount: 345,
    images: [{ url: IMG.keyboard, alt: 'Wireless Mechanical Keyboard RGB', isPrimary: true }],
    attributes: [
      { name: 'Switches', value: 'Red Linear' }, { name: 'Layout', value: 'TKL 87-key' },
      { name: 'Connectivity', value: '2.4GHz, BT5, USB-C' }, { name: 'Battery', value: '2000mAh' },
    ],
    quantity: 55,
  });

  const p9 = await createProduct({
    sku: 'NIKE-AM270-WHT-42', name: 'Nike Air Max 270 - White/Black Size 42', slug: 'nike-air-max-270-white-black-size-42',
    shortDesc: 'Max Air 270° heel unit. 100% genuine, imported from USA.',
    description: '<p><strong>Nike Air Max 270</strong> — 270° Air heel unit, breathable mesh upper, rubber outsole with flex grooves. 100% genuine, imported with original box. EU 42 / UK 8 / US 9.</p>',
    price: 14500, comparePrice: 18000, costPrice: 10000,
    categoryId: C['mens-shoes'].id, sellerId: USERS.seller2,
    condition: 'NEW', isFeatured: true, freeShipping: false, weight: 0.85,
    rating: 4.6, reviewCount: 29, soldCount: 43, viewCount: 567,
    images: [{ url: IMG.sneakers_nike, alt: 'Nike Air Max 270 White', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Nike' }, { name: 'Model', value: 'Air Max 270' },
      { name: 'Colour', value: 'White/Black' }, { name: 'Size (EU)', value: '42' },
      { name: 'Origin', value: 'Imported USA' },
    ],
    quantity: 8,
  });

  const p10 = await createProduct({
    sku: 'CASIO-GSHOCK-GA2100', name: 'Casio G-Shock GA-2100 Carbon Core - Black', slug: 'casio-g-shock-ga2100-carbon-black',
    shortDesc: 'Slim CasiOak — 11.8mm, 200M water resistant, ~3-year battery.',
    description: '<p><strong>Casio G-Shock GA-2100</strong> — Carbon Core Guard, 11.8mm slim profile, 200M water resistance, world time (48 cities), stopwatch, countdown timer, ~3-year battery.</p>',
    price: 12500, comparePrice: 14000, costPrice: 8500,
    categoryId: C['watches-jewelry'].id, sellerId: USERS.seller2,
    condition: 'NEW', isFeatured: true, freeShipping: false, weight: 0.167,
    rating: 4.7, reviewCount: 41, soldCount: 68, viewCount: 723,
    images: [{ url: IMG.watch_casio, alt: 'Casio G-Shock GA-2100', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Casio' }, { name: 'Series', value: 'G-Shock GA-2100' },
      { name: 'Water Resistance', value: '200M' }, { name: 'Thickness', value: '11.8mm' },
      { name: 'Battery Life', value: '~3 years' },
    ],
    quantity: 25,
  });

  const p11 = await createProduct({
    sku: 'LEATHR-HAND-TAN', name: 'Premium Genuine Leather Handbag - Tan Brown', slug: 'premium-leather-handbag-tan-brown',
    shortDesc: 'Handcrafted full-grain leather tote. Made in Kenya by local artisans.',
    description: '<p>100% genuine full-grain leather, handcrafted in Kenya. Dimensions: 38×28×12cm. Zippered main compartment, interior pockets, adjustable strap, brass hardware, suede lining.</p>',
    price: 8500, comparePrice: 12000, costPrice: 4500,
    categoryId: C['womens-bags'].id, sellerId: USERS.seller2,
    condition: 'NEW', freeShipping: false, weight: 0.72,
    rating: 4.5, reviewCount: 22, soldCount: 34, viewCount: 412,
    images: [{ url: IMG.handbag, alt: 'Leather Handbag Tan Brown', isPrimary: true }],
    attributes: [
      { name: 'Material', value: 'Genuine Full-grain Leather' },
      { name: 'Dimensions', value: '38×28×12cm' }, { name: 'Made In', value: 'Kenya' },
    ],
    quantity: 18,
  });

  const p12 = await createProduct({
    sku: 'LEVI-501-DARK-W32', name: "Levi's 501 Original Fit Jeans - Dark Wash W32", slug: 'levis-501-jeans-dark-wash-w32',
    shortDesc: 'The original blue jean since 1873. Button fly, 100% cotton.',
    description: "<p><strong>Levi's 501</strong> — 100% cotton denim, straight fit, button fly, 5-pocket styling, dark stonewash. Imported from USA. Machine washable.</p>",
    price: 5500, comparePrice: 7000, costPrice: 3500,
    categoryId: C['mens-trousers'].id, sellerId: USERS.seller2,
    condition: 'NEW', freeShipping: false, weight: 0.54,
    rating: 4.6, reviewCount: 48, soldCount: 112, viewCount: 634,
    images: [{ url: IMG.jeans, alt: "Levi's 501 Dark Wash", isPrimary: true }],
    attributes: [
      { name: 'Brand', value: "Levi's" }, { name: 'Style', value: '501 Original Fit' },
      { name: 'Waist', value: '32"' }, { name: 'Material', value: '100% Cotton' },
    ],
    quantity: 35,
  });

  const p13 = await createProduct({
    sku: 'SOFA-LSHAPE-GREY', name: 'L-Shape Sectional Sofa 3-Seater - Grey', slug: 'l-shape-sectional-sofa-grey',
    shortDesc: 'Modern L-shaped sofa, 30D foam. Free delivery & assembly within Nairobi.',
    description: '<p>Modern L-shape sofa (280×160×85cm), 30D high-density foam, linen-blend stain-resistant fabric, solid wood frame. Free delivery and assembly within Nairobi.</p>',
    price: 45000, comparePrice: 62000, costPrice: 30000,
    categoryId: C['furniture'].id, sellerId: USERS.seller3,
    condition: 'NEW', isFeatured: true, freeShipping: true, weight: 68,
    rating: 4.4, reviewCount: 16, soldCount: 22, viewCount: 389,
    images: [{ url: IMG.sofa, alt: 'L-Shape Sectional Sofa Grey', isPrimary: true }],
    attributes: [
      { name: 'Type', value: 'L-Shape Sectional' }, { name: 'Dimensions', value: '280×160×85cm' },
      { name: 'Foam Density', value: '30D High-density' },
    ],
    quantity: 10,
  });

  const p14 = await createProduct({
    sku: 'KENWOOD-BL600-1200W', name: 'Kenwood BL600 Blender 1200W', slug: 'kenwood-bl600-blender-1200w',
    shortDesc: '1200W, 2L jar, 6 stainless blades, 5 speeds + pulse. 240V Kenya.',
    description: '<p><strong>Kenwood BL600</strong> — 1200W motor, 2L shatterproof jar, 6 stainless steel blades, 5 speeds + pulse, ice crushing, dishwasher-safe. Kenya 240V compatible.</p>',
    price: 5800, comparePrice: 7500, costPrice: 3800,
    categoryId: C['kitchen'].id, sellerId: USERS.seller3,
    condition: 'NEW', freeShipping: false, weight: 2.1,
    rating: 4.5, reviewCount: 33, soldCount: 78, viewCount: 445,
    images: [{ url: IMG.blender, alt: 'Kenwood BL600 Blender', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Kenwood' }, { name: 'Power', value: '1200W' },
      { name: 'Capacity', value: '2 Litres' }, { name: 'Voltage', value: '240V' },
      { name: 'Warranty', value: '2 Years' },
    ],
    quantity: 40,
  });

  const p15 = await createProduct({
    sku: 'ROYALTY-10L-PRESS', name: 'Royalty Line 10L Stainless Steel Pressure Cooker', slug: 'royalty-10l-pressure-cooker',
    shortDesc: 'Boil beans in 15 minutes. Induction compatible, 3 safety features.',
    description: '<p><strong>Royalty Line 10L</strong> — 18/10 stainless steel, tri-ply base, gas/electric/induction compatible, pressure valve, lid lock, excess pressure release. Spare gasket included.</p>',
    price: 3200, comparePrice: 4500, costPrice: 1900,
    categoryId: C['kitchen'].id, sellerId: USERS.seller3,
    condition: 'NEW', freeShipping: false, weight: 2.8,
    rating: 4.6, reviewCount: 56, soldCount: 145, viewCount: 678,
    images: [{ url: IMG.pressure_cooker, alt: '10L Pressure Cooker', isPrimary: true }],
    attributes: [
      { name: 'Capacity', value: '10 Litres' }, { name: 'Material', value: '18/10 Stainless Steel' },
      { name: 'Hob Types', value: 'Gas, Electric, Induction, Ceramic' },
    ],
    quantity: 60,
  });

  const p16 = await createProduct({
    sku: 'RESTWELL-6X6-KING', name: 'Restwell Orthopaedic Spring Mattress - King 6×6ft', slug: 'restwell-orthopaedic-spring-mattress-king',
    shortDesc: 'Made in Kenya, Bonnell spring, king size, 10-year warranty.',
    description: '<p><strong>Restwell King Mattress</strong> (6×6ft, 20cm) — Bonnell spring + high-density foam quilting, hypoallergenic, fire retardant, knitted fabric cover. 10-year warranty. Made in Kenya.</p>',
    price: 28000, comparePrice: 35000, costPrice: 18000,
    categoryId: C['bedding'].id, sellerId: USERS.seller3,
    condition: 'NEW', freeShipping: true, weight: 35,
    rating: 4.5, reviewCount: 21, soldCount: 38, viewCount: 312,
    images: [{ url: IMG.mattress, alt: 'Restwell King Mattress', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Restwell' }, { name: 'Size', value: 'King 6×6ft' },
      { name: 'Type', value: 'Orthopaedic Bonnell Spring' },
      { name: 'Warranty', value: '10 Years' }, { name: 'Made In', value: 'Kenya' },
    ],
    quantity: 15,
  });

  const p17 = await createProduct({
    sku: 'GYM-DUMBELL-30KG', name: 'Adjustable Dumbbell Set 30KG - Home Gym', slug: 'adjustable-dumbbell-set-30kg',
    shortDesc: '2×15KG quick-select dial, 6 settings, chrome steel, storage tray.',
    description: '<p><strong>30KG Adjustable Dumbbells</strong> — quick-select dial (2–15KG, 6 settings), chrome-plated steel plates, anti-slip rubber grips, storage tray. Replaces 15 pairs of dumbbells.</p>',
    price: 18500, comparePrice: 24000, costPrice: 12000,
    categoryId: C['fitness-equipment'].id, sellerId: USERS.seller3,
    condition: 'NEW', freeShipping: false, weight: 32,
    rating: 4.6, reviewCount: 27, soldCount: 44, viewCount: 389,
    images: [{ url: IMG.gym_equipment, alt: 'Adjustable Dumbbell Set 30KG', isPrimary: true }],
    attributes: [
      { name: 'Total Weight', value: '30KG' }, { name: 'Per Dumbbell', value: '2KG – 15KG' },
      { name: 'Settings', value: '6 weight levels' },
    ],
    quantity: 20,
  });

  const p18 = await createProduct({
    sku: 'VITS-MULTIVIT-90', name: 'Vitastar Complete Multivitamin - 90 Tablets', slug: 'vitastar-complete-multivitamin-90',
    shortDesc: '23 vitamins & minerals, 3-month supply, KEBS certified, made in Kenya.',
    description: '<p><strong>Vitastar Multivitamin</strong> — 23 vitamins & minerals (D3, B12, Iron, Zinc, Magnesium, Vitamin C). 90 tablets = 3-month supply. Once-daily formula. KEBS certified, made in Kenya.</p>',
    price: 1800, comparePrice: 2400, costPrice: 900,
    categoryId: C['vitamins'].id, sellerId: USERS.seller3,
    condition: 'NEW', freeShipping: false, weight: 0.15,
    rating: 4.3, reviewCount: 62, soldCount: 230, viewCount: 712,
    images: [{ url: IMG.vitamins, alt: 'Vitastar Multivitamin 90 Tablets', isPrimary: true }],
    attributes: [
      { name: 'Vitamins', value: '23 vitamins & minerals' }, { name: 'Quantity', value: '90 tablets' },
      { name: 'Supply', value: '3 months' }, { name: 'Certification', value: 'KEBS' },
      { name: 'Made In', value: 'Kenya' },
    ],
    quantity: 120,
  });

  const p19 = await createProduct({
    sku: 'BOOK-RICHDAD-PB', name: 'Rich Dad Poor Dad - Robert Kiyosaki (Paperback)', slug: 'rich-dad-poor-dad-kiyosaki',
    shortDesc: '#1 personal finance book — a must-read for every Kenyan entrepreneur.',
    description: "<p><strong>Rich Dad Poor Dad</strong> — Robert Kiyosaki's #1 personal finance book. Learn why the rich don't work for money and how to make your money work for you. Paperback, brand new.</p>",
    price: 1200, comparePrice: 1500, costPrice: 650,
    categoryId: C['books'].id, sellerId: USERS.seller2,
    condition: 'NEW', freeShipping: false, weight: 0.31,
    rating: 4.8, reviewCount: 89, soldCount: 312, viewCount: 1450,
    images: [{ url: IMG.book1, alt: 'Rich Dad Poor Dad', isPrimary: true }],
    attributes: [
      { name: 'Author', value: 'Robert T. Kiyosaki' }, { name: 'Format', value: 'Paperback' },
      { name: 'Pages', value: '336' }, { name: 'Language', value: 'English' },
    ],
    quantity: 200,
  });

  const p20 = await createProduct({
    sku: 'ADI-UB4D-BLK-41', name: 'Adidas Ultraboost 4D - Black Size 41', slug: 'adidas-ultraboost-4d-black-41',
    shortDesc: '3D-printed midsole, Primeknit+ upper, Continental rubber outsole.',
    description: '<p><strong>Adidas Ultraboost 4D</strong> — 3D-printed midsole engineered from 17 years of running data, Primeknit+ recycled upper, Continental rubber outsole. EU 41.</p>',
    price: 18000, comparePrice: 22000, costPrice: 13000,
    categoryId: C['mens-shoes'].id, sellerId: USERS.seller2,
    condition: 'NEW', freeShipping: false, weight: 0.82,
    rating: 4.7, reviewCount: 17, soldCount: 28, viewCount: 340,
    images: [{ url: IMG.sneakers_adidas, alt: 'Adidas Ultraboost 4D Black', isPrimary: true }],
    attributes: [
      { name: 'Brand', value: 'Adidas' }, { name: 'Model', value: 'Ultraboost 4D' },
      { name: 'Size (EU)', value: '41' }, { name: 'Midsole', value: '4D 3D-printed' },
    ],
    quantity: 5,
  });

  console.log(`     ✅ ${await prisma.product.count()} products`);

  // ── Coupons ────────────────────────────────────────────────────────────────
  console.log('  → Coupons...');
  await prisma.coupon.createMany({
    skipDuplicates: true,
    data: [
      { code: 'WELCOME10',  type: 'PERCENTAGE',   value: 10,  minOrderAmount: 2000, maxUses: 500,  usedCount: 87,  isActive: true,  expiresAt: new Date('2026-12-31') },
      { code: 'NAIROBI500', type: 'FIXED_AMOUNT',  value: 500, minOrderAmount: 5000, maxUses: 200,  usedCount: 34,  isActive: true,  expiresAt: new Date('2026-06-30') },
      { code: 'FREESHIP',   type: 'FREE_SHIPPING', value: 0,   minOrderAmount: 3000, maxUses: 1000, usedCount: 215, isActive: true,  expiresAt: new Date('2026-12-31') },
    ],
  });
  console.log(`     ✅ ${await prisma.coupon.count()} coupons`);

  // ── Orders ─────────────────────────────────────────────────────────────────
  console.log('  → Orders...');

  await prisma.order.create({ data: {
    orderNumber: 'ORD-2026-00001', buyerId: USERS.buyer1, addressId: addr1.id,
    status: 'DELIVERED', paymentStatus: 'PAID', subtotal: 52000, shippingFee: 0, discount: 0, total: 52000,
    items: { create: [{ productId: p1.id, productName: 'Samsung Galaxy A54 5G 128GB', imageUrl: IMG.samsung_a54, quantity: 1, unitPrice: 52000, totalPrice: 52000 }] },
    statusHistory: { create: [
      { status: 'PENDING',    note: 'Order placed' },
      { status: 'CONFIRMED',  note: 'M-Pesa payment confirmed' },
      { status: 'PROCESSING', note: 'Preparing for dispatch' },
      { status: 'SHIPPED',    note: 'Dispatched via Fargo Courier' },
      { status: 'DELIVERED',  note: 'Delivered to customer' },
    ]},
    payments: { create: [{ method: 'MPESA', status: 'SUCCESS', amount: 52000, mpesaMpesaReceiptNo: 'QHA81LK2AX', mpesaPhoneNumber: '+254744000005', mpesaResultCode: 0, mpesaResultDesc: 'The service request is processed successfully.', paidAt: new Date('2026-01-15T10:30:00Z') }] },
  }});

  await prisma.order.create({ data: {
    orderNumber: 'ORD-2026-00002', buyerId: USERS.buyer2, addressId: addr2.id,
    status: 'SHIPPED', paymentStatus: 'PAID', subtotal: 27000, shippingFee: 250, discount: 0, total: 27250,
    items: { create: [
      { productId: p9.id,  productName: 'Nike Air Max 270 Size 42',  imageUrl: IMG.sneakers_nike, quantity: 1, unitPrice: 14500, totalPrice: 14500 },
      { productId: p10.id, productName: 'Casio G-Shock GA-2100',      imageUrl: IMG.watch_casio,   quantity: 1, unitPrice: 12500, totalPrice: 12500 },
    ]},
    statusHistory: { create: [
      { status: 'PENDING',   note: 'Order placed' },
      { status: 'CONFIRMED', note: 'Payment verified' },
      { status: 'SHIPPED',   note: 'Dispatched via G4S Courier' },
    ]},
    payments: { create: [{ method: 'MPESA', status: 'SUCCESS', amount: 27250, mpesaMpesaReceiptNo: 'QHB92MN3BY', mpesaPhoneNumber: '+254755000006', mpesaResultCode: 0, mpesaResultDesc: 'The service request is processed successfully.', paidAt: new Date('2026-02-10T14:20:00Z') }] },
  }});

  await prisma.order.create({ data: {
    orderNumber: 'ORD-2026-00003', buyerId: USERS.buyer3, addressId: addr3.id,
    status: 'PENDING', paymentStatus: 'UNPAID', subtotal: 78000, shippingFee: 500, discount: 0, total: 78500,
    items: { create: [{ productId: p6.id, productName: 'Sony PlayStation 5 Disc Edition', imageUrl: IMG.ps5, quantity: 1, unitPrice: 78000, totalPrice: 78000 }] },
    statusHistory: { create: [{ status: 'PENDING', note: 'Order placed, awaiting M-Pesa payment' }] },
  }});

  await prisma.order.create({ data: {
    orderNumber: 'ORD-2026-00004', buyerId: USERS.buyer1, addressId: addr1.id,
    status: 'CONFIRMED', paymentStatus: 'PAID', subtotal: 9400, shippingFee: 0, discount: 940, total: 8460,
    couponCode: 'WELCOME10', couponDiscount: 940,
    items: { create: [
      { productId: p14.id, productName: 'Kenwood BL600 Blender 1200W',      imageUrl: IMG.blender,  quantity: 1, unitPrice: 5800, totalPrice: 5800 },
      { productId: p18.id, productName: 'Vitastar Multivitamin 90 Tablets',  imageUrl: IMG.vitamins, quantity: 2, unitPrice: 1800, totalPrice: 3600 },
    ]},
    statusHistory: { create: [
      { status: 'PENDING',   note: 'Order placed' },
      { status: 'CONFIRMED', note: 'M-Pesa payment confirmed' },
    ]},
    payments: { create: [{ method: 'MPESA', status: 'SUCCESS', amount: 8460, mpesaMpesaReceiptNo: 'QHC03OP4CZ', mpesaPhoneNumber: '+254744000005', mpesaResultCode: 0, mpesaResultDesc: 'The service request is processed successfully.', paidAt: new Date('2026-02-20T09:15:00Z') }] },
  }});

  console.log(`     ✅ ${await prisma.order.count()} orders`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  console.log('  → Reviews...');
  await prisma.review.createMany({
    skipDuplicates: true,
    data: [
      { productId: p1.id,  userId: USERS.buyer1, rating: 5, title: 'Excellent phone!',           body: 'Bought for my daughter starting university. Camera is amazing and battery lasts all day. 5G works great on Safaricom. Delivery within 24 hours!',              isVerified: true,  isApproved: true },
      { productId: p1.id,  userId: USERS.buyer2, rating: 4, title: 'Great phone, minor issues',   body: 'Very good overall. Box was slightly dented but phone was perfect. Camera quality superb especially in daylight.',                                               isVerified: true,  isApproved: true },
      { productId: p2.id,  userId: USERS.buyer3, rating: 5, title: 'Best iPhone ever made',       body: 'Dynamic Island is genius. USB-C finally! Camera unmatched. Worth every shilling. Seller packaging was excellent.',                                              isVerified: false, isApproved: true },
      { productId: p6.id,  userId: USERS.buyer1, rating: 5, title: 'Gaming paradise!',             body: 'PS5 arrived well packaged. Load times virtually zero. DualSense haptics next level. Playing FIFA 25 and Spider-Man 2 — incredible.',                           isVerified: true,  isApproved: true },
      { productId: p9.id,  userId: USERS.buyer2, rating: 5, title: 'Genuine Nike, worth it',      body: 'Was sceptical buying shoes online but 100% genuine. Original Nike box with tags. Super comfortable. Fast delivery from Fashion Hub.',                            isVerified: true,  isApproved: true },
      { productId: p10.id, userId: USERS.buyer1, rating: 5, title: 'Best everyday watch',         body: 'G-Shock never disappoints. Slim profile, tough. Already survived Nairobi CBD hustle and a coast trip. Water resistance is legit.',                               isVerified: true,  isApproved: true },
      { productId: p14.id, userId: USERS.buyer1, rating: 4, title: 'Powerful blender',             body: 'Blends anything including frozen fruit. A bit loud but expected for 1200W. Easy to clean. Good value for money.',                                                isVerified: true,  isApproved: true },
      { productId: p15.id, userId: USERS.buyer2, rating: 5, title: 'Beans in 15 minutes!',        body: 'Game changer for the Kenyan kitchen. Boiled githeri in 20 minutes instead of 2 hours. Quality is solid and safety features give peace of mind.',                isVerified: true,  isApproved: true },
      { productId: p19.id, userId: USERS.buyer3, rating: 5, title: 'Life-changing book',           body: 'Everyone in Kenya should read this. Changed how I think about money completely. Bought as gift for siblings. Arrived in perfect condition.',                      isVerified: false, isApproved: true },
      { productId: p3.id,  userId: USERS.buyer3, rating: 4, title: 'Great laptop for the price',  body: 'Using for software development and it handles everything. SSD makes a huge difference. Boots Windows in about 8 seconds.',                                       isVerified: true,  isApproved: true },
    ],
  });
  console.log(`     ✅ ${await prisma.review.count()} reviews`);

  // ── Wishlist ───────────────────────────────────────────────────────────────
  console.log('  → Wishlist items...');
  await prisma.wishlistItem.createMany({
    skipDuplicates: true,
    data: [
      { userId: USERS.buyer1, productId: p2.id  },
      { userId: USERS.buyer1, productId: p5.id  },
      { userId: USERS.buyer2, productId: p1.id  },
      { userId: USERS.buyer2, productId: p13.id },
      { userId: USERS.buyer3, productId: p7.id  },
      { userId: USERS.buyer3, productId: p4.id  },
    ],
  });
  console.log(`     ✅ 6 wishlist items`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!');
  console.log(`   📂 ${await prisma.category.count()} categories`);
  console.log(`   👤 ${await prisma.user.count()} users  (1 admin · 3 sellers · 3 buyers)`);
  console.log(`   📦 ${await prisma.product.count()} products`);
  console.log(`   🛒 ${await prisma.order.count()} orders`);
  console.log(`   ⭐ ${await prisma.review.count()} reviews`);
  console.log(`   🎟️  ${await prisma.coupon.count()} coupons`);
  console.log(`   🚚 ${await prisma.shippingZone.count()} shipping zones`);
  console.log('\n   🔑 Test coupon codes:');
  console.log('      WELCOME10  — 10% off orders over KES 2,000');
  console.log('      NAIROBI500 — KES 500 off orders over KES 5,000');
  console.log('      FREESHIP   — Free shipping on orders over KES 3,000');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());