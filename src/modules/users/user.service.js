const prisma = require('../../config/database');
const { AppError } = require('../../middleware/error.middleware');

// ─────────────────────────────────────────────
//  Sync user from Keycloak token on first login
//  Called by the frontend after login succeeds.
// ─────────────────────────────────────────────

async function syncFromKeycloak(keycloakUser) {
  const { id, email, username, firstName, lastName } = keycloakUser;

  return prisma.user.upsert({
    where:  { id },
    create: { id, email, username, firstName, lastName },
    update: { email, firstName, lastName },
  });
}

// ─────────────────────────────────────────────
//  Profile
// ─────────────────────────────────────────────

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: {
      sellerProfile: true,
      addresses:     { orderBy: { isDefault: 'desc' } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

async function updateMe(userId, data) {
  const allowed = ['firstName', 'lastName', 'phone'];
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k))
  );

  return prisma.user.update({ where: { id: userId }, data: filtered });
}

const { uploadAvatarToCloudinary } = require('../../config/cloudinary');

async function uploadAvatar(userId, file) {
  const result = await uploadAvatarToCloudinary(file.buffer);
  return prisma.user.update({
    where: { id: userId },
    data:  { avatarUrl: result.url },
  });
}

// ─────────────────────────────────────────────
//  Addresses
// ─────────────────────────────────────────────

async function getAddresses(userId) {
  return prisma.address.findMany({
    where:   { userId },
    orderBy: { isDefault: 'desc' },
  });
}

async function addAddress(userId, data) {
  // If this is the first address or marked as default, clear existing defaults
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data:  { isDefault: false },
    });
  }

  const count = await prisma.address.count({ where: { userId } });
  return prisma.address.create({
    data: { ...data, userId, isDefault: count === 0 ? true : (data.isDefault || false) },
  });
}

async function updateAddress(userId, addressId, data) {
  const address = await prisma.address.findUnique({ where: { id: parseInt(addressId) } });
  if (!address || address.userId !== userId) throw new AppError('Address not found', 404);

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.update({ where: { id: parseInt(addressId) }, data });
}

async function deleteAddress(userId, addressId) {
  const address = await prisma.address.findUnique({ where: { id: parseInt(addressId) } });
  if (!address || address.userId !== userId) throw new AppError('Address not found', 404);
  await prisma.address.delete({ where: { id: parseInt(addressId) } });
}

// ─────────────────────────────────────────────
//  Wishlist
// ─────────────────────────────────────────────

async function getWishlist(userId) {
  const items = await prisma.wishlistItem.findMany({
    where:   { userId },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true, status: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return items;
}

async function addToWishlist(userId, productId) {
  return prisma.wishlistItem.upsert({
    where:  { userId_productId: { userId, productId: parseInt(productId) } },
    create: { userId, productId: parseInt(productId) },
    update: {},
  });
}

async function removeFromWishlist(userId, productId) {
  await prisma.wishlistItem.deleteMany({
    where: { userId, productId: parseInt(productId) },
  });
}

// ─────────────────────────────────────────────
//  Seller profile
// ─────────────────────────────────────────────

async function createSellerProfile(userId, data) {
  const existing = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (existing) throw new AppError('Seller profile already exists', 409);

  const [profile] = await prisma.$transaction([
    prisma.sellerProfile.create({ data: { ...data, userId } }),
    prisma.user.update({ where: { id: userId }, data: { isSeller: true } }),
  ]);

  return profile;
}

async function updateSellerProfile(userId, data) {
  return prisma.sellerProfile.update({ where: { userId }, data });
}

// ─────────────────────────────────────────────
//  Admin
// ─────────────────────────────────────────────

async function getAll(query) {
  const { page = 1, limit = 20, search } = query;
  const where = search
    ? { OR: [{ email: { contains: search } }, { username: { contains: search } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip:    (page - 1) * parseInt(limit),
      take:    parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select:  { id: true, email: true, username: true, isSeller: true, isActive: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

async function getOne(id) {
  const user = await prisma.user.findUnique({
    where:   { id },
    include: { sellerProfile: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

async function updateStatus(id, isActive) {
  return prisma.user.update({ where: { id }, data: { isActive } });
}

module.exports = {
  syncFromKeycloak, getMe, updateMe, uploadAvatar,
  getAddresses, addAddress, updateAddress, deleteAddress,
  getWishlist, addToWishlist, removeFromWishlist,
  createSellerProfile, updateSellerProfile,
  getAll, getOne, updateStatus,
};